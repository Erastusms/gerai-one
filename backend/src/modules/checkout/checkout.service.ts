import { prisma } from "../../shared/database";
import { checkoutRepository } from "./checkout.repository";
import { checkoutValidator } from "./checkout.validator";
import { inventoryService } from "../inventory/inventory.service";
import { CheckoutStatus, Prisma } from "@prisma/client";
import { NotFoundException, HttpException } from "../../shared/exceptions";
import { CreateCheckoutInput } from "./checkout.schema";

export class CheckoutService {
  // Convert prisma decimal fields to numbers for JSON serialization
  private mapSessionResponse(session: any) {
    if (!session) return null;
    return {
      ...session,
      shippingFee: session.shippingFee ? Number(session.shippingFee) : null,
      items: session.items.map((item: any) => ({
        ...item,
        price: Number(item.price),
        discountPrice: item.discountPrice ? Number(item.discountPrice) : null,
      })),
    };
  }

  // Generates user-friendly Order Number format:
  // GIO/{ROMAN_MONTH}/{YEAR}/{CUSTOMER_MONTHLY_SEQUENCE}/{GLOBAL_MONTHLY_SEQUENCE}
  private async generateOrderNumber(userId: string, tx: Prisma.TransactionClient): Promise<string> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Sequence queries inside current transaction
    const globalCount = await tx.checkoutSession.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const customerCount = await tx.checkoutSession.count({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const globalSeq = globalCount + 1;
    const customerSeq = customerCount + 1;
    
    const ROMANS = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const romanMonth = ROMANS[now.getMonth() + 1] || "I";
    const year = now.getFullYear();

    return `GIO/${romanMonth}/${year}/${customerSeq}/${globalSeq}`;
  }

  async createCheckout(userId: string, input?: CreateCheckoutInput) {
    // 1. Perform validation
    const validation = await checkoutValidator.validate(userId, input);

    if (!validation.isValid) {
      return {
        success: false,
        type: "BLOCKING" as const,
        message: "Some items are no longer available.",
        items: validation.blockingErrors,
      };
    }

    // 2. Compute expiration time (4 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 4);

    // 3. Create session & reserve stock in a database transaction
    const session = await prisma.$transaction(async (tx) => {
      // Generate Order Number
      const orderNumber = await this.generateOrderNumber(userId, tx);

      // Find user's default active address
      const defaultAddress = await tx.address.findFirst({
        where: {
          userId,
          isDefault: true,
          isDeleted: false,
        },
      });

      // Find default active shipping service
      const defaultShipping = await tx.shippingService.findFirst({
        where: { isActive: true },
        orderBy: [
          { displayOrder: "asc" },
          { name: "asc" },
        ],
      });

      const shippingSnapshot = defaultShipping ? {
        serviceId: defaultShipping.id,
        name: defaultShipping.name,
        description: defaultShipping.description,
        estimatedDelivery: defaultShipping.estimatedDeliveryMinDay === defaultShipping.estimatedDeliveryMaxDay
          ? `${defaultShipping.estimatedDeliveryMinDay} day`
          : `${defaultShipping.estimatedDeliveryMinDay}-${defaultShipping.estimatedDeliveryMaxDay} days`,
        fee: Number(defaultShipping.defaultPrice),
      } : null;

      // Create the checkout session and items snapshots
      const newSession = await checkoutRepository.createCheckoutSession(
        userId,
        orderNumber,
        expiresAt,
        validation.itemsToSnapshot,
        defaultAddress,
        shippingSnapshot,
        tx
      );

      // Reserve stock in inventory for each item
      for (const item of validation.itemsToSnapshot) {
        await inventoryService.reserveStock(item.productVariantId, item.quantity, newSession.id, tx);
      }

      // Remove selected checkout items from user's shopping cart
      await tx.cartItem.deleteMany({
        where: {
          cart: { userId },
          isSelected: true,
        },
      });

      return newSession;
    });

    return {
      success: true,
      warnings: validation.warnings,
      data: this.mapSessionResponse(session),
    };
  }

  async getCheckout(idOrOrderNumber: string) {
    let session = await checkoutRepository.findById(idOrOrderNumber);
    if (!session) {
      throw new NotFoundException(`Checkout session with ID or Order Number "${idOrOrderNumber}" not found`);
    }

    // Lazy expiration check
    if (session.status === CheckoutStatus.PENDING && session.expiresAt < new Date()) {
      session = await this.expireSession(session);
    }

    return this.mapSessionResponse(session);
  }

  async listUserCheckouts(userId: string) {
    const sessions = await checkoutRepository.findByUserId(userId);
    const result = [];

    for (let session of sessions) {
      // Lazy expiration check
      if (session.status === CheckoutStatus.PENDING && session.expiresAt < new Date()) {
        session = await this.expireSession(session);
      }
      result.push(this.mapSessionResponse(session));
    }

    return result;
  }

  async cancelCheckout(idOrOrderNumber: string) {
    const session = await checkoutRepository.findById(idOrOrderNumber);
    if (!session) {
      throw new NotFoundException(`Checkout session with ID or Order Number "${idOrOrderNumber}" not found`);
    }

    if (session.status !== CheckoutStatus.PENDING) {
      throw new HttpException(400, `Only PENDING checkout sessions can be cancelled. Current status: ${session.status}`);
    }

    // Cancel and release inventory in a transaction
    await prisma.$transaction(async (tx) => {
      // Release inventory stock for each item in checkout
      for (const item of session.items) {
        await inventoryService.releaseStock(item.productVariantId, item.quantity, session.id, tx);
      }

      // Mark session as CANCELLED
      await checkoutRepository.updateSessionStatus(session.id, CheckoutStatus.CANCELLED, tx);
    });

    return { message: "Checkout session cancelled successfully" };
  }

  // Helper method to expire a single session
  private async expireSession(session: any, tx?: Prisma.TransactionClient) {
    const runInTx = async (client: Prisma.TransactionClient) => {
      // Release stock back to available stock
      for (const item of session.items) {
        await inventoryService.releaseStock(item.productVariantId, item.quantity, session.id, client);
      }

      // Update status to EXPIRED
      return checkoutRepository.updateSessionStatus(session.id, CheckoutStatus.EXPIRED, client);
    };

    if (tx) {
      return runInTx(tx);
    } else {
      return prisma.$transaction(runInTx);
    }
  }

  // Reusable cleanup method for future background scheduler / cron jobs
  async cleanupExpiredSessions() {
    const now = new Date();
    const expiredSessions = await checkoutRepository.findExpiredSessions(now);

    for (const session of expiredSessions) {
      try {
        await this.expireSession(session);
      } catch (err) {
        // Log error and continue to other sessions to avoid blocking execution
        console.error(`Failed to expire checkout session ${session.id}:`, err);
      }
    }

    return { processedCount: expiredSessions.length };
  }

  // Update checkout session shipping address snapshot
  async updateCheckoutAddress(userId: string, idOrOrderNumber: string, addressId: string) {
    const session = await checkoutRepository.findById(idOrOrderNumber);
    if (!session) {
      throw new NotFoundException(`Checkout session with ID or Order Number "${idOrOrderNumber}" not found`);
    }

    if (session.userId !== userId) {
      throw new HttpException(403, "You do not have access to this checkout session");
    }

    if (session.status !== CheckoutStatus.PENDING) {
      throw new HttpException(400, `Only PENDING checkout sessions can be updated. Current status: ${session.status}`);
    }

    // Retrieve address
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.isDeleted) {
      throw new NotFoundException("Selected address not found");
    }

    if (address.userId !== userId) {
      throw new HttpException(403, "You do not have access to this address");
    }

    // Save snapshot of address details on session
    const updated = await checkoutRepository.updateShippingAddress(session.id, {
      label: address.label,
      recipientName: address.recipientName,
      recipientPhone: address.recipientPhone,
      province: address.province,
      city: address.city,
      district: address.district,
      subDistrict: address.subDistrict,
      postalCode: address.postalCode,
      fullAddress: address.fullAddress,
      notes: address.notes,
    });

    return this.mapSessionResponse(updated);
  }

  async updateShippingService(userId: string, idOrOrderNumber: string, shippingServiceId: string) {
    const session = await checkoutRepository.findById(idOrOrderNumber);
    if (!session) {
      throw new NotFoundException(`Checkout session with ID or Order Number "${idOrOrderNumber}" not found`);
    }

    if (session.userId !== userId) {
      throw new HttpException(403, "You do not have access to this checkout session");
    }

    if (session.status !== CheckoutStatus.PENDING) {
      throw new HttpException(400, `Only PENDING checkout sessions can be updated. Current status: ${session.status}`);
    }

    // Retrieve active shipping service
    const shippingService = await prisma.shippingService.findFirst({
      where: {
        id: shippingServiceId,
        isActive: true,
      },
    });

    if (!shippingService) {
      throw new NotFoundException(`Active shipping service with ID "${shippingServiceId}" not found`);
    }

    const estimatedDelivery = shippingService.estimatedDeliveryMinDay === shippingService.estimatedDeliveryMaxDay
      ? `${shippingService.estimatedDeliveryMinDay} day`
      : `${shippingService.estimatedDeliveryMinDay}-${shippingService.estimatedDeliveryMaxDay} days`;

    const updatedSession = await checkoutRepository.updateShippingSnapshot(session.id, {
      shippingServiceId: shippingService.id,
      shippingServiceName: shippingService.name,
      shippingServiceDescription: shippingService.description,
      shippingEstimatedDelivery: estimatedDelivery,
      shippingFee: Number(shippingService.defaultPrice),
    });

    return this.mapSessionResponse(updatedSession);
  }
}

export const checkoutService = new CheckoutService();

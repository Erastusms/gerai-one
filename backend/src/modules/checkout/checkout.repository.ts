import { prisma } from "../../shared/database";
import { CheckoutStatus, Prisma } from "@prisma/client";

const sessionInclude = {
  items: {
    include: {
      productVariant: {
        include: {
          attributeValues: {
            include: {
              attributeValue: {
                include: {
                  attribute: true,
                },
              },
            },
          },
        },
      },
    },
  },
};

export class CheckoutRepository {
  async createCheckoutSession(
    userId: string,
    orderNumber: string,
    expiresAt: Date,
    items: Array<{
      productVariantId: string;
      productName: string;
      sku: string;
      price: number;
      discountPrice: number | null;
      quantity: number;
      thumbnailUrl: string | null;
    }>,
    shippingAddress?: {
      label: string;
      recipientName: string;
      recipientPhone: string;
      province: string;
      city: string;
      district: string;
      subDistrict: string;
      postalCode: string;
      fullAddress: string;
      notes: string | null;
    } | null,
    shippingSnapshot?: {
      serviceId: string;
      name: string;
      description: string | null;
      estimatedDelivery: string;
      fee: number;
    } | null,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.checkoutSession.create({
      data: {
        userId,
        orderNumber,
        status: CheckoutStatus.PENDING,
        expiresAt,
        shippingLabel: shippingAddress?.label || null,
        shippingRecipientName: shippingAddress?.recipientName || null,
        shippingRecipientPhone: shippingAddress?.recipientPhone || null,
        shippingProvince: shippingAddress?.province || null,
        shippingCity: shippingAddress?.city || null,
        shippingDistrict: shippingAddress?.district || null,
        shippingSubDistrict: shippingAddress?.subDistrict || null,
        shippingPostalCode: shippingAddress?.postalCode || null,
        shippingFullAddress: shippingAddress?.fullAddress || null,
        shippingNotes: shippingAddress?.notes || null,
        
        // Shipping Snapshot
        shippingServiceId: shippingSnapshot?.serviceId || null,
        shippingServiceName: shippingSnapshot?.name || null,
        shippingServiceDescription: shippingSnapshot?.description || null,
        shippingEstimatedDelivery: shippingSnapshot?.estimatedDelivery || null,
        shippingFee: shippingSnapshot ? new Prisma.Decimal(shippingSnapshot.fee) : null,

        items: {
          create: items.map((item) => ({
            productVariantId: item.productVariantId,
            productName: item.productName,
            sku: item.sku,
            price: new Prisma.Decimal(item.price),
            discountPrice: item.discountPrice !== null ? new Prisma.Decimal(item.discountPrice) : null,
            quantity: item.quantity,
            thumbnailUrl: item.thumbnailUrl,
          })),
        },
      },
      include: sessionInclude,
    });
  }

  async findById(idOrOrderNumber: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrOrderNumber);

    if (isUuid) {
      return client.checkoutSession.findUnique({
        where: { id: idOrOrderNumber },
        include: sessionInclude,
      });
    }

    const normalizedOrderNumber = idOrOrderNumber.replaceAll("-", "/");
    return client.checkoutSession.findUnique({
      where: { orderNumber: normalizedOrderNumber },
      include: sessionInclude,
    });
  }

  async findByUserId(userId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.checkoutSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: sessionInclude,
    });
  }

  async updateSessionStatus(id: string, status: CheckoutStatus, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.checkoutSession.update({
      where: { id },
      data: { status },
      include: sessionInclude,
    });
  }

  async findExpiredSessions(now: Date, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.checkoutSession.findMany({
      where: {
        status: CheckoutStatus.PENDING,
        expiresAt: {
          lt: now,
        },
      },
      include: {
        items: true,
      },
    });
  }

  async updateShippingAddress(
    id: string,
    shippingAddress: {
      label: string;
      recipientName: string;
      recipientPhone: string;
      province: string;
      city: string;
      district: string;
      subDistrict: string;
      postalCode: string;
      fullAddress: string;
      notes: string | null;
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.checkoutSession.update({
      where: { id },
      data: {
        shippingLabel: shippingAddress.label,
        shippingRecipientName: shippingAddress.recipientName,
        shippingRecipientPhone: shippingAddress.recipientPhone,
        shippingProvince: shippingAddress.province,
        shippingCity: shippingAddress.city,
        shippingDistrict: shippingAddress.district,
        shippingSubDistrict: shippingAddress.subDistrict,
        shippingPostalCode: shippingAddress.postalCode,
        shippingFullAddress: shippingAddress.fullAddress,
        shippingNotes: shippingAddress.notes,
      },
      include: sessionInclude,
    });
  }

  async updateShippingSnapshot(
    id: string,
    data: {
      shippingServiceId: string | null;
      shippingServiceName: string | null;
      shippingServiceDescription: string | null;
      shippingEstimatedDelivery: string | null;
      shippingFee: number | null;
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.checkoutSession.update({
      where: { id },
      data: {
        shippingServiceId: data.shippingServiceId,
        shippingServiceName: data.shippingServiceName,
        shippingServiceDescription: data.shippingServiceDescription,
        shippingEstimatedDelivery: data.shippingEstimatedDelivery,
        shippingFee: data.shippingFee !== null ? new Prisma.Decimal(data.shippingFee) : null,
      },
      include: sessionInclude,
    });
  }
}

export const checkoutRepository = new CheckoutRepository();

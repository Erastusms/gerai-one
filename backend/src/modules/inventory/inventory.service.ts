import { inventoryRepository } from "./inventory.repository";
import { AdjustStockInput, UpdateInventoryInput } from "./inventory.schema";
import { NotFoundException, HttpException } from "../../shared/exceptions";
import { prisma } from "../../shared/database";
import { Prisma } from "@prisma/client";
import { getPaginationParams, createPaginationMeta } from "../../shared/utils/pagination";

export class InventoryService {
  async getInventory(variantId: string) {
    const inventory = await inventoryRepository.findByVariantId(variantId);
    if (!inventory) {
      throw new NotFoundException(`Inventory not found for variant ${variantId}`);
    }
    
    return {
      ...inventory,
      isLowStock: inventory.availableStock <= inventory.safetyStock,
      isOutOfStock: inventory.availableStock <= 0,
    };
  }

  async updateInventorySettings(variantId: string, input: UpdateInventoryInput) {
    const inventory = await inventoryRepository.findByVariantId(variantId);
    if (!inventory) {
      throw new NotFoundException("Inventory not found");
    }

    const updated = await inventoryRepository.updateInventoryStock(inventory.id, {
      safetyStock: input.safetyStock ?? inventory.safetyStock,
      incomingStock: input.incomingStock ?? inventory.incomingStock,
    });

    return {
      ...updated,
      isLowStock: updated.availableStock <= updated.safetyStock,
      isOutOfStock: updated.availableStock <= 0,
    };
  }

  async adjustStock(variantId: string, input: AdjustStockInput) {
    return prisma.$transaction(async (tx) => {
      const inventory = await inventoryRepository.findByVariantIdWithTx(variantId, tx);
      if (!inventory) {
        throw new NotFoundException("Inventory not found");
      }

      let newAvailableStock = inventory.availableStock;
      let newDamagedStock = inventory.damagedStock;
      
      switch (input.type) {
        case "IN":
          newAvailableStock += input.quantity;
          break;
        case "OUT":
        case "ADJUSTMENT":
          if (inventory.availableStock < input.quantity) {
            throw new HttpException(400, `Cannot decrease by ${input.quantity}. Only ${inventory.availableStock} available.`);
          }
          newAvailableStock -= input.quantity;
          break;
        case "DAMAGED":
          if (inventory.availableStock < input.quantity) {
            throw new HttpException(400, `Cannot mark ${input.quantity} as damaged. Only ${inventory.availableStock} available.`);
          }
          newAvailableStock -= input.quantity;
          newDamagedStock += input.quantity;
          break;
        default:
          throw new HttpException(400, `Manual adjustment does not support type ${input.type}`);
      }

      // Update Inventory
      const updated = await inventoryRepository.updateInventoryStock(inventory.id, {
        availableStock: newAvailableStock,
        damagedStock: newDamagedStock,
      }, tx);

      // Create Movement
      await inventoryRepository.createMovement({
        inventoryId: inventory.id,
        type: input.type,
        quantity: input.quantity,
        note: input.note,
        referenceId: input.referenceId,
        referenceType: input.referenceType,
      }, tx);

      return {
        ...updated,
        isLowStock: updated.availableStock <= updated.safetyStock,
        isOutOfStock: updated.availableStock <= 0,
      };
    });
  }

  async getInventoryHistory(variantId: string, query: any) {
    const { page, limit, skip } = getPaginationParams(query);
    
    // ensure variant exists
    const inventory = await inventoryRepository.findByVariantId(variantId);
    if (!inventory) {
      throw new NotFoundException("Inventory not found");
    }

    const [movements, totalItems] = await Promise.all([
      inventoryRepository.getMovements(variantId, limit, skip),
      inventoryRepository.countMovements(variantId),
    ]);

    const meta = createPaginationMeta(totalItems, page, limit);

    return {
      movements,
      meta,
    };
  }

  // --- REUSABLE SERVICE METHODS FOR FUTURE CHECKOUT/ORDER MODULE ---

  async reserveStock(variantId: string, quantity: number, referenceId?: string, txClient?: Prisma.TransactionClient) {
    const execute = async (tx: Prisma.TransactionClient) => {
      const inventory = await inventoryRepository.findByVariantIdWithTx(variantId, tx);
      if (!inventory) throw new NotFoundException("Inventory not found");

      if (inventory.availableStock < quantity) {
        throw new HttpException(400, `Insufficient stock for variant ${variantId}. Available: ${inventory.availableStock}`);
      }

      const updated = await inventoryRepository.updateInventoryStock(inventory.id, {
        availableStock: inventory.availableStock - quantity,
        reservedStock: inventory.reservedStock + quantity,
      }, tx);

      await inventoryRepository.createMovement({
        inventoryId: inventory.id,
        type: "RESERVE",
        quantity,
        referenceId,
        referenceType: "ORDER",
      }, tx);

      return updated;
    };

    if (txClient) return execute(txClient);
    return prisma.$transaction(execute);
  }

  async releaseStock(variantId: string, quantity: number, referenceId?: string, txClient?: Prisma.TransactionClient) {
    const execute = async (tx: Prisma.TransactionClient) => {
      const inventory = await inventoryRepository.findByVariantIdWithTx(variantId, tx);
      if (!inventory) throw new NotFoundException("Inventory not found");

      if (inventory.reservedStock < quantity) {
        throw new HttpException(400, `Cannot release more reserved stock than exists for variant ${variantId}`);
      }

      const updated = await inventoryRepository.updateInventoryStock(inventory.id, {
        availableStock: inventory.availableStock + quantity,
        reservedStock: inventory.reservedStock - quantity,
      }, tx);

      await inventoryRepository.createMovement({
        inventoryId: inventory.id,
        type: "RELEASE",
        quantity,
        referenceId,
        referenceType: "ORDER",
      }, tx);

      return updated;
    };

    if (txClient) return execute(txClient);
    return prisma.$transaction(execute);
  }

  async completeSale(variantId: string, quantity: number, referenceId?: string, txClient?: Prisma.TransactionClient) {
    const execute = async (tx: Prisma.TransactionClient) => {
      const inventory = await inventoryRepository.findByVariantIdWithTx(variantId, tx);
      if (!inventory) throw new NotFoundException("Inventory not found");

      if (inventory.reservedStock < quantity) {
        throw new HttpException(400, `Insufficient reserved stock to complete sale for variant ${variantId}`);
      }

      const updated = await inventoryRepository.updateInventoryStock(inventory.id, {
        reservedStock: inventory.reservedStock - quantity,
        soldStock: inventory.soldStock + quantity,
      }, tx);

      await inventoryRepository.createMovement({
        inventoryId: inventory.id,
        type: "SALE",
        quantity,
        referenceId,
        referenceType: "ORDER",
      }, tx);

      return updated;
    };

    if (txClient) return execute(txClient);
    return prisma.$transaction(execute);
  }

  async returnStock(variantId: string, quantity: number, isDamaged: boolean = false, referenceId?: string, txClient?: Prisma.TransactionClient) {
    const execute = async (tx: Prisma.TransactionClient) => {
      const inventory = await inventoryRepository.findByVariantIdWithTx(variantId, tx);
      if (!inventory) throw new NotFoundException("Inventory not found");

      const updateData: Prisma.InventoryUpdateInput = {};
      
      if (isDamaged) {
        updateData.damagedStock = inventory.damagedStock + quantity;
      } else {
        updateData.availableStock = inventory.availableStock + quantity;
      }
      
      // Assuming return decreases sold stock if it was sold, but business rule might say "soldStock cannot decrease".
      // Based on prompt: "soldStock cannot decrease." So we just add to available/damaged.
      
      const updated = await inventoryRepository.updateInventoryStock(inventory.id, updateData, tx);

      await inventoryRepository.createMovement({
        inventoryId: inventory.id,
        type: isDamaged ? "DAMAGED" : "RETURN",
        quantity,
        referenceId,
        referenceType: "ORDER",
        note: isDamaged ? "Returned as damaged" : "Returned in good condition",
      }, tx);

      return updated;
    };

    if (txClient) return execute(txClient);
    return prisma.$transaction(execute);
  }
}

export const inventoryService = new InventoryService();

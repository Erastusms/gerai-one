import { prisma } from "../../shared/database";
import { InventoryMovementType, Prisma } from "@prisma/client";

export class InventoryRepository {
  async findByVariantId(variantId: string) {
    return prisma.inventory.findUnique({
      where: { productVariantId: variantId },
    });
  }

  async findByVariantIdWithTx(variantId: string, tx: Prisma.TransactionClient) {
    return tx.inventory.findUnique({
      where: { productVariantId: variantId },
    });
  }

  async createInitialInventory(variantId: string, availableStock: number = 0, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.inventory.create({
      data: {
        productVariantId: variantId,
        availableStock,
      },
    });
  }

  async updateInventoryStock(
    inventoryId: string,
    data: Prisma.InventoryUpdateInput,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.inventory.update({
      where: { id: inventoryId },
      data,
    });
  }

  async createMovement(
    data: Prisma.InventoryMovementUncheckedCreateInput,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.inventoryMovement.create({
      data,
    });
  }

  async getMovements(variantId: string, limit: number = 50, skip: number = 0) {
    const inventory = await this.findByVariantId(variantId);
    if (!inventory) return [];
    
    return prisma.inventoryMovement.findMany({
      where: { inventoryId: inventory.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    });
  }

  async countMovements(variantId: string) {
    const inventory = await this.findByVariantId(variantId);
    if (!inventory) return 0;

    return prisma.inventoryMovement.count({
      where: { inventoryId: inventory.id },
    });
  }
}

export const inventoryRepository = new InventoryRepository();

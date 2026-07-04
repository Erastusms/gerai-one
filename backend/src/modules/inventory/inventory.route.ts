import { FastifyInstance } from "fastify";
import { inventoryController } from "./inventory.controller";
import {
  getInventorySwagger,
  getInventoryHistorySwagger,
  adjustStockSwagger,
  updateSettingsSwagger,
} from "./inventory.swagger";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";

export async function inventoryRoutes(fastify: FastifyInstance) {
  // Get Inventory for a variant
  fastify.get(
    "/api/v1/inventory/:variantId",
    {
      schema: getInventorySwagger.schema,
      preHandler: [authMiddleware],
    },
    inventoryController.handleGetInventory as any
  );

  // Get Inventory History
  fastify.get(
    "/api/v1/inventory/:variantId/history",
    {
      schema: getInventoryHistorySwagger.schema,
      preHandler: [authMiddleware],
    },
    inventoryController.handleGetInventoryHistory as any
  );

  // Adjust Stock
  fastify.patch(
    "/api/v1/inventory/:variantId/adjust",
    {
      schema: adjustStockSwagger.schema,
      preHandler: [authMiddleware],
    },
    inventoryController.handleAdjustStock as any
  );

  // Update Settings
  fastify.patch(
    "/api/v1/inventory/:variantId/settings",
    {
      schema: updateSettingsSwagger.schema,
      preHandler: [authMiddleware],
    },
    inventoryController.handleUpdateSettings as any
  );
}

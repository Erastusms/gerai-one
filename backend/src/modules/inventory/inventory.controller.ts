import { FastifyRequest, FastifyReply } from "fastify";
import { inventoryService } from "./inventory.service";
import { AdjustStockInput, UpdateInventoryInput } from "./inventory.schema";

export class InventoryController {
  async handleGetInventory(req: FastifyRequest<{ Params: { variantId: string } }>, reply: FastifyReply) {
    const { variantId } = req.params;
    const data = await inventoryService.getInventory(variantId);
    return reply.send({
      success: true,
      data,
    });
  }

  async handleGetInventoryHistory(req: FastifyRequest<{ Params: { variantId: string }, Querystring: any }>, reply: FastifyReply) {
    const { variantId } = req.params;
    const result = await inventoryService.getInventoryHistory(variantId, req.query);
    return reply.send({
      success: true,
      ...result,
    });
  }

  async handleAdjustStock(req: FastifyRequest<{ Params: { variantId: string }, Body: AdjustStockInput }>, reply: FastifyReply) {
    const { variantId } = req.params;
    const data = await inventoryService.adjustStock(variantId, req.body);
    return reply.send({
      success: true,
      message: "Stock adjusted successfully",
      data,
    });
  }

  async handleUpdateSettings(req: FastifyRequest<{ Params: { variantId: string }, Body: UpdateInventoryInput }>, reply: FastifyReply) {
    const { variantId } = req.params;
    const data = await inventoryService.updateInventorySettings(variantId, req.body);
    return reply.send({
      success: true,
      message: "Inventory settings updated successfully",
      data,
    });
  }
}

export const inventoryController = new InventoryController();

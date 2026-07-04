import { z } from "zod";

export const getInventorySwagger = {
  schema: {
    description: "Get inventory for a product variant",
    tags: ["Inventory"],
    summary: "Get inventory for a product variant",
    params: z.object({
      variantId: z.string().uuid(),
    }),
    response: {
      200: z.object({
        success: z.boolean(),
        data: z.any(),
      }),
    },
  },
};

export const getInventoryHistorySwagger = {
  schema: {
    description: "Get inventory movement history",
    tags: ["Inventory"],
    summary: "Get inventory movement history",
    params: z.object({
      variantId: z.string().uuid(),
    }),
    querystring: z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
    }),
    response: {
      200: z.object({
        success: z.boolean(),
        movements: z.array(z.any()),
        meta: z.any(),
      }),
    },
  },
};

export const adjustStockSwagger = {
  schema: {
    description: "Adjust stock for a variant",
    tags: ["Inventory"],
    summary: "Adjust stock for a variant",
    params: z.object({
      variantId: z.string().uuid(),
    }),
    body: z.object({
      type: z.enum(["IN", "OUT", "ADJUSTMENT", "DAMAGED", "RETURN", "SALE", "RESERVE", "RELEASE"]),
      quantity: z.number().int().min(1),
      note: z.string().optional(),
      referenceId: z.string().optional(),
      referenceType: z.string().optional(),
    }),
    response: {
      200: z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.any(),
      }),
    },
  },
};

export const updateSettingsSwagger = {
  schema: {
    description: "Update inventory settings",
    tags: ["Inventory"],
    summary: "Update inventory settings",
    params: z.object({
      variantId: z.string().uuid(),
    }),
    body: z.object({
      safetyStock: z.number().int().min(0).optional(),
      incomingStock: z.number().int().min(0).optional(),
    }),
    response: {
      200: z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.any(),
      }),
    },
  },
};

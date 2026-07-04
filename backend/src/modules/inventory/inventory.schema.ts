import { z } from "zod";

export const AdjustStockInputSchema = z.object({
  type: z.enum(["IN", "OUT", "ADJUSTMENT", "DAMAGED", "RETURN", "SALE", "RESERVE", "RELEASE"], {
    required_error: "Movement type is required",
  }),
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1"),
  note: z.string().optional(),
  referenceId: z.string().optional(),
  referenceType: z.string().optional(),
});

export type AdjustStockInput = z.infer<typeof AdjustStockInputSchema>;

export const UpdateInventoryInputSchema = z.object({
  safetyStock: z.number().int().min(0).optional(),
  incomingStock: z.number().int().min(0).optional(),
});

export type UpdateInventoryInput = z.infer<typeof UpdateInventoryInputSchema>;

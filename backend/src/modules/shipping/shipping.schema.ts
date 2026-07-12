import { z } from "zod";

export const createShippingServiceInputSchema = z.object({
  code: z.string().min(1, "Code is required").toUpperCase(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  estimatedDeliveryMinDay: z.coerce.number().int().min(0, "Minimum delivery days must be non-negative"),
  estimatedDeliveryMaxDay: z.coerce.number().int().min(0, "Maximum delivery days must be non-negative"),
  defaultPrice: z.coerce.number().min(0, "Default price must be non-negative"),
  displayOrder: z.coerce.number().int().min(0, "Display order must be non-negative").optional().default(0),
  isActive: z.boolean().optional().default(true),
}).refine(
  (data) => data.estimatedDeliveryMaxDay >= data.estimatedDeliveryMinDay,
  {
    message: "Maximum delivery days must be greater than or equal to minimum delivery days",
    path: ["estimatedDeliveryMaxDay"],
  }
);

export const updateShippingServiceInputSchema = z.object({
  code: z.string().min(1).toUpperCase().optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  estimatedDeliveryMinDay: z.coerce.number().int().min(0).optional(),
  estimatedDeliveryMaxDay: z.coerce.number().int().min(0).optional(),
  defaultPrice: z.coerce.number().min(0).optional(),
  displayOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.estimatedDeliveryMinDay !== undefined && data.estimatedDeliveryMaxDay !== undefined) {
      return data.estimatedDeliveryMaxDay >= data.estimatedDeliveryMinDay;
    }
    return true;
  },
  {
    message: "Maximum delivery days must be greater than or equal to minimum delivery days",
    path: ["estimatedDeliveryMaxDay"],
  }
);

export const updateShippingServiceStatusInputSchema = z.object({
  isActive: z.boolean({
    required_error: "isActive status is required",
  }),
});

export const selectShippingServiceInputSchema = z.object({
  shippingServiceId: z.string().uuid("Invalid shipping service ID format"),
});

export type CreateShippingServiceInput = z.infer<typeof createShippingServiceInputSchema>;
export type UpdateShippingServiceInput = z.infer<typeof updateShippingServiceInputSchema>;
export type UpdateShippingServiceStatusInput = z.infer<typeof updateShippingServiceStatusInputSchema>;
export type SelectShippingServiceInput = z.infer<typeof selectShippingServiceInputSchema>;

// Response schemas for Swagger
export const shippingServiceResponseSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  estimatedDeliveryMinDay: z.number(),
  estimatedDeliveryMaxDay: z.number(),
  defaultPrice: z.number(),
  displayOrder: z.number(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

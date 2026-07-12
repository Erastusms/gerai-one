import { z } from "zod";

export const checkoutItemInputSchema = z.object({
  productVariantId: z.string().uuid("Invalid variant ID format"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  discountPrice: z.coerce.number().min(0, "Discount price must be non-negative").nullable().optional(),
});

export const createCheckoutInputSchema = z.object({
  items: z.array(checkoutItemInputSchema).optional(),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutInputSchema>;

// Response schemas for Swagger
export const checkoutItemResponseSchema = z.object({
  id: z.string().uuid(),
  checkoutSessionId: z.string().uuid(),
  productVariantId: z.string().uuid(),
  productName: z.string(),
  sku: z.string(),
  price: z.number(),
  discountPrice: z.number().nullable(),
  quantity: z.number().int(),
  thumbnailUrl: z.string().nullable(),
});

export const checkoutSessionResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  orderNumber: z.string(),
  status: z.enum(["PENDING", "EXPIRED", "COMPLETED", "CANCELLED"]),
  expiresAt: z.date().or(z.string()),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  shippingLabel: z.string().nullable().optional(),
  shippingRecipientName: z.string().nullable().optional(),
  shippingRecipientPhone: z.string().nullable().optional(),
  shippingProvince: z.string().nullable().optional(),
  shippingCity: z.string().nullable().optional(),
  shippingDistrict: z.string().nullable().optional(),
  shippingSubDistrict: z.string().nullable().optional(),
  shippingPostalCode: z.string().nullable().optional(),
  shippingFullAddress: z.string().nullable().optional(),
  shippingNotes: z.string().nullable().optional(),

  // Shipping snapshot
  shippingServiceId: z.string().uuid().nullable().optional(),
  shippingServiceName: z.string().nullable().optional(),
  shippingServiceDescription: z.string().nullable().optional(),
  shippingEstimatedDelivery: z.string().nullable().optional(),
  shippingFee: z.number().nullable().optional(),

  items: z.array(checkoutItemResponseSchema),
});

export const updateCheckoutAddressSchema = z.object({
  addressId: z.string().uuid("Invalid address ID format"),
});

export const updateCheckoutShippingSchema = z.object({
  shippingServiceId: z.string().uuid("Invalid shipping service ID format"),
});

export type UpdateCheckoutAddressInput = z.infer<typeof updateCheckoutAddressSchema>;
export type UpdateCheckoutShippingInput = z.infer<typeof updateCheckoutShippingSchema>;

export const checkoutWarningSchema = z.object({
  type: z.enum(["PRICE_CHANGED", "DISCOUNT_CHANGED"]),
  message: z.string(),
});

export const checkoutSuccessResponseSchema = z.object({
  session: checkoutSessionResponseSchema,
  warnings: z.array(checkoutWarningSchema),
});

export const blockingValidationErrorItemSchema = z.object({
  productVariantId: z.string().uuid(),
  name: z.string(),
  sku: z.string(),
  quantity: z.number().int(),
  availableStock: z.number().int(),
  reason: z.enum(["INSUFFICIENT_STOCK", "PRODUCT_INACTIVE", "VARIANT_INACTIVE"]),
});

export const blockingValidationResponseSchema = z.object({
  success: z.literal(false),
  type: z.literal("BLOCKING"),
  message: z.string(),
  items: z.array(blockingValidationErrorItemSchema),
});

export type CheckoutWarning = z.infer<typeof checkoutWarningSchema>;
export type BlockingValidationErrorItem = z.infer<typeof blockingValidationErrorItemSchema>;

import { z } from 'zod';

// Input Schemas
export const addToCartSchema = z.object({
  productVariantId: z.string().uuid('Invalid product variant ID format'),
  quantity: z.coerce
    .number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .default(1),
});

export const updateQuantitySchema = z.object({
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
});

export const selectItemSchema = z.object({
  isSelected: z.boolean(),
});

export const selectAllSchema = z.object({
  isSelected: z.boolean(),
});

export const cartItemParamsSchema = z.object({
  id: z.string().uuid('Invalid cart item ID format'),
});

// Response Schemas for Swagger
export const brandInfoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  logoUrl: z.string().nullable(),
});

export const attributeInfoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export const attributeValueInfoSchema = z.object({
  id: z.string().uuid(),
  value: z.string(),
  attribute: attributeInfoSchema,
});

export const variantAttributeValueInfoSchema = z.object({
  attributeValue: attributeValueInfoSchema,
});

export const cartProductInfoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  price: z.union([z.string(), z.number()]),
  discountPrice: z.union([z.string(), z.number()]).nullable(),
  thumbnailUrl: z.string().nullable(),
  isActive: z.boolean(),
  brand: brandInfoSchema.nullable(),
});

export const cartProductVariantInfoSchema = z.object({
  id: z.string().uuid(),
  sku: z.string(),
  price: z.union([z.string(), z.number()]),
  availableStock: z.number().int(),
  isOutOfStock: z.boolean(),
  weight: z.number().nullable(),
  isActive: z.boolean(),
  attributeValues: z.array(variantAttributeValueInfoSchema),
  product: cartProductInfoSchema,
});

export const cartItemResponseSchema = z.object({
  id: z.string().uuid(),
  cartId: z.string().uuid(),
  productVariantId: z.string().uuid(),
  quantity: z.number().int(),
  isSelected: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  productVariant: cartProductVariantInfoSchema,
});

export const cartSummarySchema = z.object({
  selectedItemCount: z.number().int(),
  selectedQuantity: z.number().int(),
  subtotal: z.number(),
  discount: z.number(),
  grandTotal: z.number(),
});

export const cartResponseSchema = z.object({
  items: z.array(cartItemResponseSchema),
  summary: cartSummarySchema,
});

// Infer types
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateQuantityInput = z.infer<typeof updateQuantitySchema>;
export type SelectItemInput = z.infer<typeof selectItemSchema>;
export type SelectAllInput = z.infer<typeof selectAllSchema>;
export type CartItemParams = z.infer<typeof cartItemParamsSchema>;

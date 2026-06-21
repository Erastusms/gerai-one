import { z } from "zod";
import { productDetailResponseSchema } from "../product/product.schema";

export const wishlistResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  productId: z.string().uuid(),
  createdAt: z.date(),
  product: productDetailResponseSchema.optional(),
});

export const createWishlistItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID format"),
});

export const wishlistSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateWishlistItemInput = z.infer<typeof createWishlistItemSchema>;
export type WishlistSearchQuery = z.infer<typeof wishlistSearchSchema>;

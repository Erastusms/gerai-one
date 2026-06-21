import { z } from "zod";
import {
  createWishlistItemSchema,
  wishlistSearchSchema,
  wishlistResponseSchema,
} from "./wishlist.schema";
import { productDetailResponseSchema } from "../product/product.schema";
import { apiSuccessResponseSchema, apiErrorResponseSchema } from "../auth/auth.schema";

export const addToWishlistSwagger = {
  schema: {
    description: "Add an active product to the user's wishlist (Authenticated users only)",
    tags: ["Wishlist"],
    summary: "Add to wishlist",
    security: [{ BearerAuth: [] }],
    body: createWishlistItemSchema,
    response: {
      201: apiSuccessResponseSchema(wishlistResponseSchema).describe("Product added to wishlist successfully"),
      400: apiErrorResponseSchema.describe("Validation errors"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
      404: apiErrorResponseSchema.describe("Product not found"),
      409: apiErrorResponseSchema.describe("Product already wishlisted"),
    },
  },
};

export const removeFromWishlistSwagger = {
  schema: {
    description: "Remove a product from the user's wishlist (Authenticated users only)",
    tags: ["Wishlist"],
    summary: "Remove from wishlist",
    security: [{ BearerAuth: [] }],
    params: z.object({
      productId: z.string().uuid("Invalid product ID format"),
    }),
    response: {
      200: apiSuccessResponseSchema(wishlistResponseSchema).describe("Product removed from wishlist successfully"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
      404: apiErrorResponseSchema.describe("Product not in wishlist"),
    },
  },
};

export const getWishlistSwagger = {
  schema: {
    description: "Retrieve a paginated list of products in the user's wishlist (Authenticated users only)",
    tags: ["Wishlist"],
    summary: "Get user wishlist",
    security: [{ BearerAuth: [] }],
    querystring: wishlistSearchSchema,
    response: {
      200: apiSuccessResponseSchema(z.array(productDetailResponseSchema)).describe("Wishlist retrieved successfully"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
    },
  },
};

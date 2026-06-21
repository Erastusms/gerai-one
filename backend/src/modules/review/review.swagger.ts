import { z } from "zod";
import {
  createReviewSchema,
  updateReviewSchema,
  reviewSearchSchema,
  reviewResponseSchema,
} from "./review.schema";
import { apiSuccessResponseSchema, apiErrorResponseSchema } from "../auth/auth.schema";

export const createReviewSwagger = {
  schema: {
    description: "Write a new product review (Authenticated users only, maximum 1 review per user per product)",
    tags: ["Reviews"],
    summary: "Write product review",
    security: [{ BearerAuth: [] }],
    body: createReviewSchema,
    response: {
      201: apiSuccessResponseSchema(reviewResponseSchema).describe("Review submitted successfully"),
      400: apiErrorResponseSchema.describe("Validation errors"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
      409: apiErrorResponseSchema.describe("User has already reviewed this product"),
    },
  },
};

export const updateReviewSwagger = {
  schema: {
    description: "Modify an existing product review (Authenticated owners only)",
    tags: ["Reviews"],
    summary: "Update review details",
    security: [{ BearerAuth: [] }],
    params: z.object({
      id: z.string().uuid("Invalid review ID format"),
    }),
    body: updateReviewSchema,
    response: {
      200: apiSuccessResponseSchema(reviewResponseSchema).describe("Review updated successfully"),
      400: apiErrorResponseSchema.describe("Validation or parameter errors"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
      403: apiErrorResponseSchema.describe("Forbidden (not owner)"),
      404: apiErrorResponseSchema.describe("Review not found"),
    },
  },
};

export const deleteReviewSwagger = {
  schema: {
    description: "Soft delete a product review (Authenticated owners only)",
    tags: ["Reviews"],
    summary: "Delete product review",
    security: [{ BearerAuth: [] }],
    params: z.object({
      id: z.string().uuid("Invalid review ID format"),
    }),
    response: {
      200: apiSuccessResponseSchema(reviewResponseSchema).describe("Review soft-deleted successfully"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
      403: apiErrorResponseSchema.describe("Forbidden (not owner)"),
      404: apiErrorResponseSchema.describe("Review not found"),
    },
  },
};

export const getProductReviewsSwagger = {
  schema: {
    description: "Retrieve a paginated list of reviews for a product",
    tags: ["Reviews"],
    summary: "Get reviews list by product ID",
    params: z.object({
      productId: z.string().uuid("Invalid product ID format"),
    }),
    querystring: reviewSearchSchema,
    response: {
      200: apiSuccessResponseSchema(z.array(reviewResponseSchema)).describe("Reviews list retrieved successfully"),
      400: apiErrorResponseSchema.describe("Invalid parameters"),
      404: apiErrorResponseSchema.describe("Product not found"),
    },
  },
};

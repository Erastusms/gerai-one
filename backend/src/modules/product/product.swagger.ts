import { z } from "zod";
import {
  createProductSchema,
  updateProductSchema,
  productSearchSchema,
  productDetailResponseSchema,
} from "./product.schema";
import { apiSuccessResponseSchema, apiErrorResponseSchema } from "../auth/auth.schema";

export const createProductSwagger = {
  schema: {
    description: "Create a new product with images, specifications, and categories (Admin only)",
    tags: ["Products"],
    summary: "Create product",
    security: [{ BearerAuth: [] }],
    body: createProductSchema,
    response: {
      201: apiSuccessResponseSchema(productDetailResponseSchema).describe("Product created successfully"),
      400: apiErrorResponseSchema.describe("Validation errors"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
      409: apiErrorResponseSchema.describe("Product SKU or slug already exists"),
    },
  },
};

export const updateProductSwagger = {
  schema: {
    description: "Update details and relationships of an existing product (Admin only)",
    tags: ["Products"],
    summary: "Update product",
    security: [{ BearerAuth: [] }],
    params: z.object({
      id: z.string().uuid("Invalid product ID format"),
    }),
    body: updateProductSchema,
    response: {
      200: apiSuccessResponseSchema(productDetailResponseSchema).describe("Product updated successfully"),
      400: apiErrorResponseSchema.describe("Validation or parameter errors"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
      404: apiErrorResponseSchema.describe("Product not found"),
      409: apiErrorResponseSchema.describe("Product SKU or slug already exists"),
    },
  },
};

export const deleteProductSwagger = {
  schema: {
    description: "Soft delete an existing product (Admin only)",
    tags: ["Products"],
    summary: "Soft delete product",
    security: [{ BearerAuth: [] }],
    params: z.object({
      id: z.string().uuid("Invalid product ID format"),
    }),
    response: {
      200: apiSuccessResponseSchema(productDetailResponseSchema).describe("Product soft-deleted successfully"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
      404: apiErrorResponseSchema.describe("Product not found"),
    },
  },
};

export const getProductsSwagger = {
  schema: {
    description: "Search, filter, sort, and paginate active products",
    tags: ["Products"],
    summary: "List and search products",
    querystring: productSearchSchema,
    response: {
      200: apiSuccessResponseSchema(z.array(productDetailResponseSchema)).describe("Products retrieved successfully"),
      400: apiErrorResponseSchema.describe("Invalid filter parameters"),
    },
  },
};

export const getProductFilterOptionsSwagger = {
  schema: {
    description: "Retrieve available categories and brands based on search query",
    tags: ["Products"],
    summary: "Get filter options for search results",
    querystring: z.object({
      search: z.string().optional(),
    }),
    response: {
      200: apiSuccessResponseSchema(
        z.object({
          categories: z.array(
            z.object({
              id: z.string().uuid(),
              name: z.string(),
              slug: z.string(),
              productCount: z.number().optional(),
            })
          ),
          brands: z.array(
            z.object({
              id: z.string().uuid(),
              name: z.string(),
              slug: z.string(),
              productCount: z.number().optional(),
            })
          ),
        })
      ).describe("Filter options retrieved successfully"),
    },
  },
};

export const getProductDetailSwagger = {
  schema: {
    description: "Retrieve a product's full catalog details by its slug",
    tags: ["Products"],
    summary: "Get product details by slug",
    params: z.object({
      slug: z.string().min(1, "Slug parameter is required"),
    }),
    response: {
      200: apiSuccessResponseSchema(productDetailResponseSchema).describe("Product details retrieved successfully"),
      404: apiErrorResponseSchema.describe("Product not found or is inactive"),
    },
  },
};

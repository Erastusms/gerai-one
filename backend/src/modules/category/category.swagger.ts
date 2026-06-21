import { z } from "zod";
import {
  createCategorySchema,
  updateCategorySchema,
  categorySearchSchema,
  categoryResponseSchema,
  categoryWithProductCountSchema,
} from "./category.schema";
import { apiSuccessResponseSchema, apiErrorResponseSchema } from "../auth/auth.schema";

// Simple representation of products in category detail swagger docs.
// To avoid circular dependency, we define a basic product schema here,
// or we can reuse/import if needed. A simple product schema matches what is returned.
const simpleProductSchema = z.object({
  id: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  slug: z.string(),
  shortDescription: z.string().nullable(),
  price: z.any(), // Decimal gets serialized to dynamic representation
  discountPrice: z.any().nullable(),
  thumbnailUrl: z.string().nullable(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createCategorySwagger = {
  schema: {
    description: "Create a new product category (Admin only)",
    tags: ["Categories"],
    summary: "Create category",
    security: [{ BearerAuth: [] }],
    body: createCategorySchema,
    response: {
      201: apiSuccessResponseSchema(categoryResponseSchema).describe("Category created successfully"),
      400: apiErrorResponseSchema.describe("Validation errors"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
      409: apiErrorResponseSchema.describe("Category slug already exists"),
    },
  },
};

export const updateCategorySwagger = {
  schema: {
    description: "Update an existing category (Admin only)",
    tags: ["Categories"],
    summary: "Update category",
    security: [{ BearerAuth: [] }],
    params: z.object({
      id: z.string().uuid("Invalid category ID format"),
    }),
    body: updateCategorySchema,
    response: {
      200: apiSuccessResponseSchema(categoryResponseSchema).describe("Category updated successfully"),
      400: apiErrorResponseSchema.describe("Validation or parameter errors"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
      404: apiErrorResponseSchema.describe("Category not found"),
      409: apiErrorResponseSchema.describe("Category slug already exists"),
    },
  },
};

export const deleteCategorySwagger = {
  schema: {
    description: "Soft delete an existing category (Admin only)",
    tags: ["Categories"],
    summary: "Soft delete category",
    security: [{ BearerAuth: [] }],
    params: z.object({
      id: z.string().uuid("Invalid category ID format"),
    }),
    response: {
      200: apiSuccessResponseSchema(categoryResponseSchema).describe("Category soft-deleted successfully"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
      404: apiErrorResponseSchema.describe("Category not found"),
    },
  },
};

export const getCategoriesSwagger = {
  schema: {
    description: "Retrieve a paginated list of active categories with their product counts",
    tags: ["Categories"],
    summary: "List active categories",
    querystring: categorySearchSchema,
    response: {
      200: apiSuccessResponseSchema(z.array(categoryWithProductCountSchema)).describe("Categories retrieved successfully"),
      400: apiErrorResponseSchema.describe("Invalid search parameters"),
    },
  },
};

export const getCategoryDetailSwagger = {
  schema: {
    description: "Retrieve details of a category by slug and a paginated list of products inside it",
    tags: ["Categories"],
    summary: "Get category details with products",
    params: z.object({
      slug: z.string().min(1, "Slug parameter is required"),
    }),
    querystring: categorySearchSchema,
    response: {
      200: apiSuccessResponseSchema(
        z.object({
          category: categoryResponseSchema,
          products: z.array(simpleProductSchema),
        })
      ).describe("Category details with products retrieved successfully"),
      404: apiErrorResponseSchema.describe("Category not found or is inactive"),
    },
  },
};

import { z } from "zod";
import {
  createBrandSchema,
  updateBrandSchema,
  brandSearchSchema,
  brandResponseSchema,
} from "./brand.schema";
import { apiSuccessResponseSchema, apiErrorResponseSchema } from "../auth/auth.schema";

const simpleProductSchema = z.object({
  id: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  slug: z.string(),
  shortDescription: z.string().nullable(),
  price: z.any(),
  discountPrice: z.any().nullable(),
  thumbnailUrl: z.string().nullable(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createBrandSwagger = {
  schema: {
    description: "Create a new product brand (Admin only)",
    tags: ["Brands"],
    summary: "Create brand",
    security: [{ BearerAuth: [] }],
    body: createBrandSchema,
    response: {
      201: apiSuccessResponseSchema(brandResponseSchema).describe("Brand created successfully"),
      400: apiErrorResponseSchema.describe("Validation errors"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
      409: apiErrorResponseSchema.describe("Brand slug already exists"),
    },
  },
};

export const updateBrandSwagger = {
  schema: {
    description: "Update an existing brand (Admin only)",
    tags: ["Brands"],
    summary: "Update brand",
    security: [{ BearerAuth: [] }],
    params: z.object({
      id: z.string().uuid("Invalid brand ID format"),
    }),
    body: updateBrandSchema,
    response: {
      200: apiSuccessResponseSchema(brandResponseSchema).describe("Brand updated successfully"),
      400: apiErrorResponseSchema.describe("Validation or parameter errors"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
      404: apiErrorResponseSchema.describe("Brand not found"),
      409: apiErrorResponseSchema.describe("Brand slug already exists"),
    },
  },
};

export const deleteBrandSwagger = {
  schema: {
    description: "Soft delete an existing brand (Admin only)",
    tags: ["Brands"],
    summary: "Soft delete brand",
    security: [{ BearerAuth: [] }],
    params: z.object({
      id: z.string().uuid("Invalid brand ID format"),
    }),
    response: {
      200: apiSuccessResponseSchema(brandResponseSchema).describe("Brand soft-deleted successfully"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
      404: apiErrorResponseSchema.describe("Brand not found"),
    },
  },
};

export const getBrandsSwagger = {
  schema: {
    description: "Retrieve a paginated list of active brands",
    tags: ["Brands"],
    summary: "List active brands",
    querystring: brandSearchSchema,
    response: {
      200: apiSuccessResponseSchema(z.array(brandResponseSchema)).describe("Brands retrieved successfully"),
      400: apiErrorResponseSchema.describe("Invalid search parameters"),
    },
  },
};

export const getBrandDetailSwagger = {
  schema: {
    description: "Retrieve details of a brand by slug and a paginated list of products under it",
    tags: ["Brands"],
    summary: "Get brand details with products",
    params: z.object({
      slug: z.string().min(1, "Slug parameter is required"),
    }),
    querystring: brandSearchSchema,
    response: {
      200: apiSuccessResponseSchema(
        z.object({
          brand: brandResponseSchema,
          products: z.array(simpleProductSchema),
        })
      ).describe("Brand details with products retrieved successfully"),
      404: apiErrorResponseSchema.describe("Brand not found or is inactive"),
    },
  },
};

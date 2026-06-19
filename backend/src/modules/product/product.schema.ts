import { z } from "zod";
import { categoryResponseSchema } from "../category/category.schema";

export const productResponseSchema = z.object({
  id: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  slug: z.string(),
  shortDescription: z.string().nullable(),
  description: z.string().nullable(),
  brand: z.string().nullable(),
  price: z.any(), // Decimal gets serialized to dynamic representation
  discountPrice: z.any().nullable(),
  weight: z.number().nullable(),
  thumbnailUrl: z.string().nullable(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export const productImageSchema = z.object({
  id: z.string().uuid(),
  imageUrl: z.string(),
  sortOrder: z.number().int(),
});

export const productSpecificationSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  value: z.string(),
});

export const productDetailResponseSchema = productResponseSchema.extend({
  images: z.array(productImageSchema),
  specifications: z.array(productSpecificationSchema),
  categories: z.array(categoryResponseSchema),
});

export const createProductSchema = z.object({
  sku: z.string().min(1, "SKU is required").max(100),
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  shortDescription: z.string().max(500).optional().nullable(),
  description: z.string().optional().nullable(),
  brand: z.string().max(100).optional().nullable(),
  price: z.number().positive("Price must be positive"),
  discountPrice: z.number().nonnegative("Discount price must be non-negative").optional().nullable(),
  weight: z.number().positive("Weight must be positive").optional().nullable(),
  thumbnailUrl: z.string().url("Invalid thumbnail URL").max(500).optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  categoryIds: z.array(z.string().uuid()).optional(),
  images: z
    .array(
      z.object({
        imageUrl: z.string().url("Invalid image URL").max(500),
        sortOrder: z.number().int().default(0),
      })
    )
    .optional(),
  specifications: z
    .array(
      z.object({
        key: z.string().min(1, "Key is required").max(100),
        value: z.string().min(1, "Value is required").max(255),
      })
    )
    .optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  categorySlug: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  brand: z.string().optional(),
  isFeatured: z
    .preprocess((val) => {
      if (val === "true" || val === true) return true;
      if (val === "false" || val === false) return false;
      return undefined;
    }, z.boolean())
    .optional(),
  sort: z
    .enum(["newest", "oldest", "priceAsc", "priceDesc", "nameAsc", "nameDesc"])
    .default("newest"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductSearchQuery = z.infer<typeof productSearchSchema>;

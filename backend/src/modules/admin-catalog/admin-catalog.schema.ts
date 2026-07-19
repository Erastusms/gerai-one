import { z } from "zod"

export const catalogQuerySchema = z.object({
  page: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().min(1)).optional(),
  limit: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().min(1).max(100)).optional(),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  brandId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
})

export type CatalogQueryInput = z.infer<typeof catalogQuerySchema>

// Products
export const createAdminProductSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  sku: z.string().min(1).max(100),
  shortDescription: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  brandId: z.string().uuid().optional().nullable(),
  categoryIds: z.array(z.string().uuid()).optional(),
  price: z.number().positive(),
  discountPrice: z.number().positive().optional().nullable(),
  weight: z.number().positive().optional().nullable(),
  stock: z.number().int().nonnegative().optional().default(0),
  thumbnailUrl: z.string().url().optional().nullable(),
  imageUrls: z.array(z.string().url()).optional(),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.string().optional().nullable(),
})

export type CreateAdminProductInput = z.infer<typeof createAdminProductSchema>

export const updateAdminProductSchema = createAdminProductSchema.partial()
export type UpdateAdminProductInput = z.infer<typeof updateAdminProductSchema>

// Categories
export const createAdminCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

export type CreateAdminCategoryInput = z.infer<typeof createAdminCategorySchema>
export const updateAdminCategorySchema = createAdminCategorySchema.partial()
export type UpdateAdminCategoryInput = z.infer<typeof updateAdminCategorySchema>

// Brands
export const createAdminBrandSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  logoUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

export type CreateAdminBrandInput = z.infer<typeof createAdminBrandSchema>
export const updateAdminBrandSchema = createAdminBrandSchema.partial()
export type UpdateAdminBrandInput = z.infer<typeof updateAdminBrandSchema>

// Variants
export const createAdminVariantSchema = z.object({
  productId: z.string().uuid(),
  sku: z.string().min(1).max(100),
  price: z.number().positive(),
  weight: z.number().positive().optional().nullable(),
  stock: z.number().int().nonnegative().optional().default(0),
  isActive: z.boolean().optional().default(true),
})

export type CreateAdminVariantInput = z.infer<typeof createAdminVariantSchema>
export const updateAdminVariantSchema = createAdminVariantSchema.partial()
export type UpdateAdminVariantInput = z.infer<typeof updateAdminVariantSchema>

// Attributes
export const createAdminAttributeSchema = z.object({
  name: z.string().min(1).max(100),
  values: z.array(z.string()).optional(),
})

export type CreateAdminAttributeInput = z.infer<typeof createAdminAttributeSchema>
export const updateAdminAttributeSchema = createAdminAttributeSchema.partial()
export type UpdateAdminAttributeInput = z.infer<typeof updateAdminAttributeSchema>

// Reviews
export const updateAdminReviewSchema = z.object({
  isHidden: z.boolean().optional(),
})

export type UpdateAdminReviewInput = z.infer<typeof updateAdminReviewSchema>

// SEO
export const updateProductSeoSchema = z.object({
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.string().optional().nullable(),
  slug: z.string().optional(),
})

export type UpdateProductSeoInput = z.infer<typeof updateProductSeoSchema>

import { z } from "zod";

export const categoryResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export const categoryWithProductCountSchema = categoryResponseSchema.extend({
  productCount: z.number().int().nonnegative(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  description: z.string().max(1000).optional().nullable(),
  imageUrl: z.string().url("Invalid image URL").max(500).optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = z.object({
  name: z.string().max(255).optional(),
  slug: z.string().max(255).optional(),
  description: z.string().max(1000).optional().nullable(),
  imageUrl: z.string().url("Invalid image URL").max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const categorySearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategorySearchQuery = z.infer<typeof categorySearchSchema>;

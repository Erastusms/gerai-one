import { z } from "zod";

export const brandResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  logoUrl: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export const createBrandSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  logoUrl: z.string().url("Invalid logo URL").max(500).optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateBrandSchema = z.object({
  name: z.string().max(255).optional(),
  slug: z.string().max(255).optional(),
  logoUrl: z.string().url("Invalid logo URL").max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const brandSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
export type BrandSearchQuery = z.infer<typeof brandSearchSchema>;

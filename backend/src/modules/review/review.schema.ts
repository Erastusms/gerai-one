import { z } from "zod";

export const reviewUserSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().nullable(),
  imageUrl: z.string().nullable(),
});

export const reviewResponseSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  userId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  isVerifiedPurchase: z.boolean(),
  helpfulCount: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  user: reviewUserSchema.optional(),
});

export const createReviewSchema = z.object({
  productId: z.string().uuid("Invalid product ID format"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot be more than 5"),
  comment: z.string().max(2000, "Comment cannot exceed 2000 characters").optional().nullable(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(2000).optional().nullable(),
});

export const reviewSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewSearchQuery = z.infer<typeof reviewSearchSchema>;

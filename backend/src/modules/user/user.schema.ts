import { z } from "zod";
import { userResponseSchema } from "../auth/auth.schema";

// Profile update input validation schema
export const updateProfileSchema = z.object({
  fullName: z.string().max(100).optional().nullable(),
  username: z.string().max(50).optional().nullable(),
  phoneNumber: z.string().max(20).optional().nullable(),
  gender: z.string().max(20).optional().nullable(),
  dateOfBirth: z.preprocess(
    (val) => (typeof val === "string" && val === "" ? null : val),
    z.string().datetime().or(z.date()).optional().nullable()
  ),
  profilePhoto: z.string().url().max(255).optional().nullable(),
  isProfileCompleted: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Detailed Profile Response Schema
export const profileResponseSchema = z.object({
  id: z.string().uuid(),
  clerkUserId: z.string(),
  email: z.string().email(),
  fullName: z.string().nullable(),
  username: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  gender: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  profilePhoto: z.string().nullable(),
  isProfileCompleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProfileResponse = z.infer<typeof profileResponseSchema>;

export { userResponseSchema };


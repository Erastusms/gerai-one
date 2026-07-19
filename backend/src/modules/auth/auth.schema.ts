import { z } from "zod";

// Base User Response Schema
export const userResponseSchema = z.object({
  id: z.string().uuid(),
  clerkId: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  fullName: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
  phoneNumber: z.string().nullable(),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

// Clerk Webhook Event Schema
export const clerkWebhookSchema = z.object({
  type: z.string(),
  object: z.string().optional(),
  data: z.record(z.any()),
});

// Standard API Success Response wrapper
export const apiSuccessResponseSchema = (dataSchema: z.ZodTypeAny) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    data: dataSchema,
    meta: z.any().nullable(),
  });

// Standard API Error Response wrapper
export const apiErrorResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  errors: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      })
    )
    .optional(),
});

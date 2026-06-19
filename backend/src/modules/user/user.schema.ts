import { z } from "zod";
import { userResponseSchema } from "../auth/auth.schema";

// Profile update input validation schema
export const updateProfileSchema = z.object({
  firstName: z.string().max(50).optional().nullable(),
  lastName: z.string().max(50).optional().nullable(),
  imageUrl: z.string().url().max(255).optional().nullable(),
  phoneNumber: z.string().max(20).optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export { userResponseSchema };

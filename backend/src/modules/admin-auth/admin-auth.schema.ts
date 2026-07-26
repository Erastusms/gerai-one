import { z } from "zod"

export const loginAdminSchema = z.object({
  identifier: z.string().min(1, "Email or Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
})

export type LoginAdminInput = z.infer<typeof loginAdminSchema>

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
})

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>

import { z } from "zod"
import { apiSuccessResponseSchema } from "../auth/auth.schema"
import { loginAdminSchema, refreshTokenSchema } from "./admin-auth.schema"

export const loginAdminSwagger = {
  schema: {
    description: "Authenticate Admin or Super Admin user using Email/Username and Password",
    tags: ["Admin Auth"],
    summary: "Admin login",
    body: loginAdminSchema,
    response: {
      200: apiSuccessResponseSchema(
        z.object({
          user: z.any(),
          accessToken: z.string(),
          refreshToken: z.string(),
        })
      ).describe("Admin login successful"),
    },
  },
}

export const logoutAdminSwagger = {
  schema: {
    description: "Invalidate admin session and clear authentication HttpOnly cookies",
    tags: ["Admin Auth"],
    summary: "Admin logout",
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(z.null()).describe("Logged out successfully"),
    },
  },
}

export const getMeAdminSwagger = {
  schema: {
    description: "Retrieve profile details of currently authenticated Admin user",
    tags: ["Admin Auth"],
    summary: "Get current admin profile",
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Admin profile retrieved successfully"),
    },
  },
}

export const refreshAdminTokenSwagger = {
  schema: {
    description: "Refresh Admin Access Token using HttpOnly refresh token cookie or body payload",
    tags: ["Admin Auth"],
    summary: "Refresh admin session token",
    body: refreshTokenSchema.optional(),
    response: {
      200: apiSuccessResponseSchema(
        z.object({
          user: z.any(),
          accessToken: z.string(),
        })
      ).describe("Session refreshed successfully"),
    },
  },
}

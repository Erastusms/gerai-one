import { FastifyInstance } from "fastify"
import { adminAuthController } from "./admin-auth.controller"
import { adminAuthMiddleware } from "../../shared/middlewares/admin-auth.middleware"
import {
  loginAdminSwagger,
  logoutAdminSwagger,
  getMeAdminSwagger,
  refreshAdminTokenSwagger,
} from "./admin-auth.swagger"

export async function adminAuthRoutes(fastify: FastifyInstance) {
  // Public Login & Refresh
  fastify.post("/api/v1/admin/auth/login", loginAdminSwagger, adminAuthController.handleLogin)
  fastify.post("/api/v1/admin/auth/refresh", refreshAdminTokenSwagger, adminAuthController.handleRefresh)
  fastify.post("/api/v1/admin/auth/logout", logoutAdminSwagger, adminAuthController.handleLogout)

  // Protected /me route
  fastify.get(
    "/api/v1/admin/auth/me",
    {
      schema: getMeAdminSwagger.schema,
      preHandler: [adminAuthMiddleware],
    },
    adminAuthController.handleGetMe
  )
}

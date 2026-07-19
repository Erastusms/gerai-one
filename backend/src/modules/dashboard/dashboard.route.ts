import { FastifyInstance } from "fastify"
import { dashboardController } from "./dashboard.controller"
import { getDashboardOverviewSwagger } from "./dashboard.swagger"
import { authMiddleware } from "../../shared/middlewares/auth.middleware"
import { requireRoles } from "../../shared/middlewares/role.middleware"

export async function dashboardRoutes(fastify: FastifyInstance) {
  // Apply authentication globally to dashboard routes
  fastify.addHook("preHandler", authMiddleware)

  // GET /api/v1/admin/dashboard/overview (Admin only)
  fastify.get(
    "/api/v1/admin/dashboard/overview",
    {
      schema: getDashboardOverviewSwagger.schema,
      preHandler: [requireRoles("ADMIN", "SUPER_ADMIN")],
    },
    dashboardController.handleGetOverview as any
  )
}

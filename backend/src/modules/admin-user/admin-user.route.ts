import { FastifyInstance } from "fastify"
import { adminUserController } from "./admin-user.controller"
import {
  getCustomersSwagger,
  getCustomerByIdSwagger,
  updateCustomerSwagger,
  getAdminUsersSwagger,
  createAdminUserSwagger,
  updateAdminUserSwagger,
  getRolesSwagger,
  createRoleSwagger,
  updateRoleSwagger,
  getPermissionsSwagger,
  updatePermissionsSwagger,
} from "./admin-user.swagger"
import { authMiddleware } from "../../shared/middlewares/auth.middleware"
import { requireRoles } from "../../shared/middlewares/role.middleware"

export async function adminUserRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware)
  const adminGuard = [requireRoles("ADMIN", "SUPER_ADMIN")]

  // Customers
  fastify.get(
    "/api/v1/admin/customers",
    { schema: getCustomersSwagger.schema, preHandler: adminGuard },
    adminUserController.handleGetCustomers as any
  )

  fastify.get(
    "/api/v1/admin/customers/:id",
    { schema: getCustomerByIdSwagger.schema, preHandler: adminGuard },
    adminUserController.handleGetCustomerById as any
  )

  fastify.patch(
    "/api/v1/admin/customers/:id",
    { schema: updateCustomerSwagger.schema, preHandler: adminGuard },
    adminUserController.handleUpdateCustomer as any
  )

  // Admin Users
  fastify.get(
    "/api/v1/admin/admin-users",
    { schema: getAdminUsersSwagger.schema, preHandler: adminGuard },
    adminUserController.handleGetAdminUsers as any
  )

  fastify.post(
    "/api/v1/admin/admin-users",
    { schema: createAdminUserSwagger.schema, preHandler: adminGuard },
    adminUserController.handleCreateAdminUser as any
  )

  fastify.patch(
    "/api/v1/admin/admin-users/:id",
    { schema: updateAdminUserSwagger.schema, preHandler: adminGuard },
    adminUserController.handleUpdateAdminUser as any
  )

  // Roles
  fastify.get(
    "/api/v1/admin/roles",
    { schema: getRolesSwagger.schema, preHandler: adminGuard },
    adminUserController.handleGetRoles as any
  )

  fastify.post(
    "/api/v1/admin/roles",
    { schema: createRoleSwagger.schema, preHandler: adminGuard },
    adminUserController.handleCreateRole as any
  )

  fastify.patch(
    "/api/v1/admin/roles/:id",
    { schema: updateRoleSwagger.schema, preHandler: adminGuard },
    adminUserController.handleUpdateRole as any
  )

  // Permissions
  fastify.get(
    "/api/v1/admin/permissions",
    { schema: getPermissionsSwagger.schema, preHandler: adminGuard },
    adminUserController.handleGetPermissions as any
  )

  fastify.patch(
    "/api/v1/admin/permissions",
    { schema: updatePermissionsSwagger.schema, preHandler: adminGuard },
    adminUserController.handleUpdatePermissions as any
  )
}

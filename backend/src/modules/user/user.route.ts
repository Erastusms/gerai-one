import { FastifyInstance } from "fastify";
import { userController } from "./user.controller";
import { getProfileSwagger, updateProfileSwagger, deleteProfileSwagger, getAdminUsersSwagger } from "./user.swagger";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";
import { requireRoles } from "../../shared/middlewares/role.middleware";

export async function userRoutes(fastify: FastifyInstance) {
  // Apply authMiddleware globally to all routes in this plugin
  fastify.addHook("preHandler", authMiddleware);

  // Admin User List
  fastify.get(
    "/api/v1/admin/users",
    {
      schema: getAdminUsersSwagger.schema,
      preHandler: [requireRoles("ADMIN", "SUPER_ADMIN")],
    },
    userController.handleAdminListUsers as any
  );

  // New Profile GET
  fastify.get(
    "/api/v1/profile",
    {
      schema: getProfileSwagger.schema,
    },
    userController.handleGetProfile
  );

  // New Profile PATCH
  fastify.patch(
    "/api/v1/profile",
    {
      schema: updateProfileSwagger.schema,
    },
    userController.handleUpdateProfile
  );

  // Existing Profile GET (for compatibility)
  fastify.get(
    "/api/v1/users/profile",
    {
      schema: getProfileSwagger.schema,
    },
    userController.handleGetProfile
  );

  // Existing Profile PUT (for compatibility)
  fastify.put(
    "/api/v1/users/profile",
    {
      schema: updateProfileSwagger.schema,
    },
    userController.handleUpdateProfile
  );

  // Existing Profile DELETE (soft delete)
  fastify.delete(
    "/api/v1/users/profile",
    {
      schema: deleteProfileSwagger.schema,
    },
    userController.handleDeleteProfile
  );
}


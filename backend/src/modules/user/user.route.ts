import { FastifyInstance } from "fastify";
import { userController } from "./user.controller";
import { getProfileSwagger, updateProfileSwagger, deleteProfileSwagger } from "./user.swagger";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";

export async function userRoutes(fastify: FastifyInstance) {
  // Apply authMiddleware globally to all routes in this plugin
  fastify.addHook("preHandler", authMiddleware);

  // Profile GET
  fastify.get(
    "/api/v1/users/profile",
    {
      schema: getProfileSwagger.schema,
    },
    userController.handleGetProfile
  );

  // Profile PUT
  fastify.put(
    "/api/v1/users/profile",
    {
      schema: updateProfileSwagger.schema,
    },
    userController.handleUpdateProfile
  );

  // Profile DELETE (soft delete)
  fastify.delete(
    "/api/v1/users/profile",
    {
      schema: deleteProfileSwagger.schema,
    },
    userController.handleDeleteProfile
  );
}

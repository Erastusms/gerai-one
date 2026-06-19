import { FastifyInstance } from "fastify";
import { authController } from "./auth.controller";
import { webhookSwagger, meSwagger } from "./auth.swagger";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";

export async function authRoutes(fastify: FastifyInstance) {
  // Clerk webhook listener route
  fastify.post(
    "/api/v1/auth/webhooks/clerk",
    {
      config: {
        rawBody: true, // Enable raw-body capture for signature check
      },
      schema: webhookSwagger.schema,
    },
    authController.handleClerkWebhook
  );

  // Authenticated Profile Me route
  fastify.get(
    "/api/v1/auth/me",
    {
      preHandler: [authMiddleware], // Require authenticated Clerk session
      schema: meSwagger.schema,
    },
    authController.handleMe
  );
}

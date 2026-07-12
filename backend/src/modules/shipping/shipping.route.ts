import { FastifyInstance } from "fastify";
import { shippingController } from "./shipping.controller";
import {
  getActiveShippingServicesSwagger,
  getAdminShippingServicesSwagger,
  createShippingServiceSwagger,
  updateShippingServiceSwagger,
  updateShippingServiceStatusSwagger,
} from "./shipping.swagger";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";

export async function shippingRoutes(fastify: FastifyInstance) {
  // Public/Customer: Get active shipping services
  fastify.get(
    "/api/v1/shipping-services",
    {
      schema: getActiveShippingServicesSwagger.schema,
    },
    shippingController.handleGetActiveShippingServices as any
  );

  // Admin: Get all shipping services
  fastify.get(
    "/api/v1/admin/shipping-services",
    {
      schema: getAdminShippingServicesSwagger.schema,
      preHandler: [authMiddleware],
    },
    shippingController.handleGetAdminShippingServices as any
  );

  // Admin: Create shipping service
  fastify.post(
    "/api/v1/admin/shipping-services",
    {
      schema: createShippingServiceSwagger.schema,
      preHandler: [authMiddleware],
    },
    shippingController.handleCreateShippingService as any
  );

  // Admin: Update shipping service
  fastify.patch(
    "/api/v1/admin/shipping-services/:id",
    {
      schema: updateShippingServiceSwagger.schema,
      preHandler: [authMiddleware],
    },
    shippingController.handleUpdateShippingService as any
  );

  // Admin: Toggle active status
  fastify.patch(
    "/api/v1/admin/shipping-services/:id/status",
    {
      schema: updateShippingServiceStatusSwagger.schema,
      preHandler: [authMiddleware],
    },
    shippingController.handleUpdateStatus as any
  );
}

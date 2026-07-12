import { FastifyInstance } from "fastify";
import { checkoutController } from "./checkout.controller";
import {
  createCheckoutSwagger,
  listCheckoutsSwagger,
  getCheckoutSwagger,
  cancelCheckoutSwagger,
  updateCheckoutAddressSwagger,
  updateCheckoutShippingSwagger,
} from "./checkout.swagger";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";

export async function checkoutRoutes(fastify: FastifyInstance) {
  // Create checkout session
  fastify.post(
    "/api/v1/checkout",
    {
      schema: createCheckoutSwagger.schema,
      preHandler: [authMiddleware],
    },
    checkoutController.handleCreateCheckout as any
  );

  // List user checkout sessions
  fastify.get(
    "/api/v1/checkout",
    {
      schema: listCheckoutsSwagger.schema,
      preHandler: [authMiddleware],
    },
    checkoutController.handleListCheckouts as any
  );

  // Get checkout session details
  fastify.get(
    "/api/v1/checkout/:idOrOrderNumber",
    {
      schema: getCheckoutSwagger.schema,
      preHandler: [authMiddleware],
    },
    checkoutController.handleGetCheckout as any
  );

  // Cancel checkout session
  fastify.delete(
    "/api/v1/checkout/:idOrOrderNumber",
    {
      schema: cancelCheckoutSwagger.schema,
      preHandler: [authMiddleware],
    },
    checkoutController.handleCancelCheckout as any
  );

  // Update shipping address snapshot
  fastify.patch(
    "/api/v1/checkout/:idOrOrderNumber/address",
    {
      schema: updateCheckoutAddressSwagger.schema,
      preHandler: [authMiddleware],
    },
    checkoutController.handleUpdateCheckoutAddress as any
  );

  // Update shipping service snapshot
  fastify.patch(
    "/api/v1/checkout/:idOrOrderNumber/shipping-service",
    {
      schema: updateCheckoutShippingSwagger.schema,
      preHandler: [authMiddleware],
    },
    checkoutController.handleUpdateCheckoutShipping as any
  );
}

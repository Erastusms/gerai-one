import { FastifyRequest, FastifyReply } from "fastify";
import { checkoutService } from "./checkout.service";
import { CreateCheckoutInput } from "./checkout.schema";
import { createSuccessResponse } from "../../shared/responses";

export class CheckoutController {
  async handleCreateCheckout(
    request: FastifyRequest<{ Body: CreateCheckoutInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.id;
    const result = await checkoutService.createCheckout(userId, request.body);

    if (result.success === false) {
      return reply.status(400).send(result);
    }

    return reply.status(201).send(
      createSuccessResponse("Checkout session created successfully", {
        session: result.data,
        warnings: result.warnings,
      })
    );
  }

  async handleListCheckouts(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const userId = request.user!.id;
    const sessions = await checkoutService.listUserCheckouts(userId);

    return reply.status(200).send(
      createSuccessResponse("Checkout sessions retrieved successfully", sessions)
    );
  }

  async handleGetCheckout(
    request: FastifyRequest<{ Params: { idOrOrderNumber: string } }>,
    reply: FastifyReply
  ) {
    const { idOrOrderNumber } = request.params;
    const session = await checkoutService.getCheckout(idOrOrderNumber);

    return reply.status(200).send(
      createSuccessResponse("Checkout session retrieved successfully", session)
    );
  }

  async handleCancelCheckout(
    request: FastifyRequest<{ Params: { idOrOrderNumber: string } }>,
    reply: FastifyReply
  ) {
    const { idOrOrderNumber } = request.params;
    const result = await checkoutService.cancelCheckout(idOrOrderNumber);

    return reply.status(200).send(
      createSuccessResponse(result.message, null)
    );
  }

  async handleUpdateCheckoutAddress(
    request: FastifyRequest<{ Params: { idOrOrderNumber: string }; Body: { addressId: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.id;
    const { idOrOrderNumber } = request.params;
    const { addressId } = request.body;

    const updated = await checkoutService.updateCheckoutAddress(userId, idOrOrderNumber, addressId);

    return reply.status(200).send(
      createSuccessResponse("Checkout shipping address updated successfully", updated)
    );
  }

  async handleUpdateCheckoutShipping(
    request: FastifyRequest<{ Params: { idOrOrderNumber: string }; Body: { shippingServiceId: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.id;
    const { idOrOrderNumber } = request.params;
    const { shippingServiceId } = request.body;

    const updated = await checkoutService.updateShippingService(userId, idOrOrderNumber, shippingServiceId);

    return reply.status(200).send(
      createSuccessResponse("Checkout shipping service updated successfully", updated)
    );
  }
}

export const checkoutController = new CheckoutController();

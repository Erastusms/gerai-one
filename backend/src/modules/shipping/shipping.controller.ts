import { FastifyRequest, FastifyReply } from "fastify";
import { shippingService } from "./shipping.service";
import { CreateShippingServiceInput, UpdateShippingServiceInput, UpdateShippingServiceStatusInput } from "./shipping.schema";
import { createSuccessResponse } from "../../shared/responses";

export class ShippingController {
  async handleGetActiveShippingServices(_request: FastifyRequest, reply: FastifyReply) {
    const services = await shippingService.getActiveShippingServices();
    return reply.status(200).send(
      createSuccessResponse("Active shipping services retrieved successfully", services)
    );
  }

  async handleGetAdminShippingServices(_request: FastifyRequest, reply: FastifyReply) {
    const services = await shippingService.getAdminShippingServices();
    return reply.status(200).send(
      createSuccessResponse("All shipping services retrieved successfully", services)
    );
  }

  async handleCreateShippingService(
    request: FastifyRequest<{ Body: CreateShippingServiceInput }>,
    reply: FastifyReply
  ) {
    const service = await shippingService.createShippingService(request.body);
    return reply.status(201).send(
      createSuccessResponse("Shipping service created successfully", service)
    );
  }

  async handleUpdateShippingService(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateShippingServiceInput }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const service = await shippingService.updateShippingService(id, request.body);
    return reply.status(200).send(
      createSuccessResponse("Shipping service updated successfully", service)
    );
  }

  async handleUpdateStatus(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateShippingServiceStatusInput }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const { isActive } = request.body;
    const service = await shippingService.updateStatus(id, isActive);
    return reply.status(200).send(
      createSuccessResponse("Shipping service status updated successfully", service)
    );
  }
}

export const shippingController = new ShippingController();

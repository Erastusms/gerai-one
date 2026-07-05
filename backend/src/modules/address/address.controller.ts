import { FastifyRequest, FastifyReply } from "fastify";
import { addressService } from "./address.service";
import { CreateAddressInput, UpdateAddressInput } from "./address.schema";
import { createSuccessResponse } from "../../shared/responses";
import { UnauthorizedException } from "../../shared/exceptions";

function mapToAddressResponse(address: any) {
  return {
    id: address.id,
    userId: address.userId,
    label: address.label,
    recipientName: address.recipientName,
    recipientPhone: address.recipientPhone,
    province: address.province,
    city: address.city,
    district: address.district,
    subDistrict: address.subDistrict,
    postalCode: address.postalCode,
    fullAddress: address.fullAddress,
    notes: address.notes,
    isDefault: address.isDefault,
    isDeleted: address.isDeleted,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  };
}

export class AddressController {
  async handleList(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException("Authenticated user context is missing");
    }

    const list = await addressService.listAddresses(user.id);
    return reply.status(200).send(
      createSuccessResponse("Addresses retrieved successfully", list.map(mapToAddressResponse))
    );
  }

  async handleCreate(
    request: FastifyRequest<{ Body: CreateAddressInput }>,
    reply: FastifyReply
  ) {
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException("Authenticated user context is missing");
    }

    const created = await addressService.createAddress(user.id, request.body);
    return reply.status(201).send(
      createSuccessResponse("Address created successfully", mapToAddressResponse(created))
    );
  }

  async handleUpdate(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateAddressInput }>,
    reply: FastifyReply
  ) {
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException("Authenticated user context is missing");
    }

    const addressId = request.params.id;
    const updated = await addressService.updateAddress(user.id, addressId, request.body);
    return reply.status(200).send(
      createSuccessResponse("Address updated successfully", mapToAddressResponse(updated))
    );
  }

  async handleDelete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException("Authenticated user context is missing");
    }

    const addressId = request.params.id;
    const deleted = await addressService.deleteAddress(user.id, addressId);
    return reply.status(200).send(
      createSuccessResponse("Address deleted successfully", mapToAddressResponse(deleted))
    );
  }

  async handleSetDefault(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException("Authenticated user context is missing");
    }

    const addressId = request.params.id;
    const updated = await addressService.setDefaultAddress(user.id, addressId);
    return reply.status(200).send(
      createSuccessResponse("Default address updated successfully", mapToAddressResponse(updated))
    );
  }
}

export const addressController = new AddressController();

import { FastifyInstance } from "fastify";
import { addressController } from "./address.controller";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";
import {
  listAddressesSwagger,
  createAddressSwagger,
  updateAddressSwagger,
  deleteAddressSwagger,
  setDefaultAddressSwagger,
} from "./address.swagger";

export async function addressRoutes(fastify: FastifyInstance) {
  // Apply authMiddleware globally to all address endpoints
  fastify.addHook("preHandler", authMiddleware);

  fastify.get(
    "/api/v1/addresses",
    { schema: listAddressesSwagger.schema },
    addressController.handleList
  );

  fastify.post(
    "/api/v1/addresses",
    { schema: createAddressSwagger.schema },
    addressController.handleCreate
  );

  fastify.patch(
    "/api/v1/addresses/:id",
    { schema: updateAddressSwagger.schema },
    addressController.handleUpdate
  );

  fastify.delete(
    "/api/v1/addresses/:id",
    { schema: deleteAddressSwagger.schema },
    addressController.handleDelete
  );

  // Set default address
  fastify.patch(
    "/api/v1/addresses/:id/default",
    { schema: setDefaultAddressSwagger.schema },
    addressController.handleSetDefault
  );
}

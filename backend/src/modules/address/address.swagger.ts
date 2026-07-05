import { createAddressSchema, updateAddressSchema, addressResponseSchema } from "./address.schema";
import { apiSuccessResponseSchema, apiErrorResponseSchema } from "../auth/auth.schema";
import { z } from "zod";

export const listAddressesSwagger = {
  schema: {
    description: "Retrieve a list of shipping addresses for the logged-in user",
    tags: ["Address"],
    summary: "Get saved addresses",
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(z.array(addressResponseSchema)).describe("List of addresses"),
      401: apiErrorResponseSchema.describe("Invalid session token"),
    },
  },
};

export const createAddressSwagger = {
  schema: {
    description: "Create a new shipping address for the logged-in user",
    tags: ["Address"],
    summary: "Create address",
    security: [{ BearerAuth: [] }],
    body: createAddressSchema,
    response: {
      201: apiSuccessResponseSchema(addressResponseSchema).describe("Address created successfully"),
      400: apiErrorResponseSchema.describe("Validation errors"),
      401: apiErrorResponseSchema.describe("Invalid session token"),
    },
  },
};

export const updateAddressSwagger = {
  schema: {
    description: "Update details of an existing shipping address",
    tags: ["Address"],
    summary: "Update address",
    security: [{ BearerAuth: [] }],
    params: z.object({
      id: z.string().uuid(),
    }),
    body: updateAddressSchema,
    response: {
      200: apiSuccessResponseSchema(addressResponseSchema).describe("Address updated successfully"),
      400: apiErrorResponseSchema.describe("Validation errors"),
      401: apiErrorResponseSchema.describe("Invalid session token"),
      403: apiErrorResponseSchema.describe("Access forbidden"),
      404: apiErrorResponseSchema.describe("Address not found"),
    },
  },
};

export const deleteAddressSwagger = {
  schema: {
    description: "Soft delete a shipping address. It is not permanently removed from database.",
    tags: ["Address"],
    summary: "Delete address",
    security: [{ BearerAuth: [] }],
    params: z.object({
      id: z.string().uuid(),
    }),
    response: {
      200: apiSuccessResponseSchema(addressResponseSchema).describe("Address soft deleted successfully"),
      401: apiErrorResponseSchema.describe("Invalid session token"),
      403: apiErrorResponseSchema.describe("Access forbidden"),
      404: apiErrorResponseSchema.describe("Address not found"),
    },
  },
};

export const setDefaultAddressSwagger = {
  schema: {
    description: "Mark a shipping address as the default address for the logged-in user",
    tags: ["Address"],
    summary: "Set default address",
    security: [{ BearerAuth: [] }],
    params: z.object({
      id: z.string().uuid(),
    }),
    response: {
      200: apiSuccessResponseSchema(addressResponseSchema).describe("Default address updated successfully"),
      401: apiErrorResponseSchema.describe("Invalid session token"),
      403: apiErrorResponseSchema.describe("Access forbidden"),
      404: apiErrorResponseSchema.describe("Address not found"),
    },
  },
};

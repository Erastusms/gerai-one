import { z } from "zod";
import {
  createShippingServiceInputSchema,
  updateShippingServiceInputSchema,
  updateShippingServiceStatusInputSchema,
  shippingServiceResponseSchema,
} from "./shipping.schema";
import { apiSuccessResponseSchema, apiErrorResponseSchema } from "../auth/auth.schema";

export const getActiveShippingServicesSwagger = {
  schema: {
    description: "Retrieve all active shipping services for checkout (Public or Authenticated)",
    tags: ["Shipping"],
    summary: "Get active shipping services",
    response: {
      200: apiSuccessResponseSchema(z.array(shippingServiceResponseSchema)).describe("Active shipping services list"),
    },
  },
};

export const getAdminShippingServicesSwagger = {
  schema: {
    description: "Retrieve all shipping services including inactive ones (Admin only)",
    tags: ["Admin Shipping"],
    summary: "Get all shipping services (Admin)",
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(z.array(shippingServiceResponseSchema)).describe("All shipping services list"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
      403: apiErrorResponseSchema.describe("Forbidden"),
    },
  },
};

export const createShippingServiceSwagger = {
  schema: {
    description: "Create a new shipping service (Admin only)",
    tags: ["Admin Shipping"],
    summary: "Create shipping service",
    security: [{ BearerAuth: [] }],
    body: createShippingServiceInputSchema,
    response: {
      201: apiSuccessResponseSchema(shippingServiceResponseSchema).describe("Shipping service created successfully"),
      400: apiErrorResponseSchema.describe("Validation error"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
      403: apiErrorResponseSchema.describe("Forbidden"),
      409: apiErrorResponseSchema.describe("Code already exists"),
    },
  },
};

export const updateShippingServiceSwagger = {
  schema: {
    description: "Update details of an existing shipping service (Admin only)",
    tags: ["Admin Shipping"],
    summary: "Update shipping service",
    security: [{ BearerAuth: [] }],
    params: z.object({
      id: z.string().uuid("Invalid shipping service ID format"),
    }),
    body: updateShippingServiceInputSchema,
    response: {
      200: apiSuccessResponseSchema(shippingServiceResponseSchema).describe("Shipping service updated successfully"),
      400: apiErrorResponseSchema.describe("Validation error"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
      403: apiErrorResponseSchema.describe("Forbidden"),
      404: apiErrorResponseSchema.describe("Shipping service not found"),
      409: apiErrorResponseSchema.describe("Code already exists"),
    },
  },
};

export const updateShippingServiceStatusSwagger = {
  schema: {
    description: "Toggle active status of a shipping service (Admin only)",
    tags: ["Admin Shipping"],
    summary: "Toggle shipping service status",
    security: [{ BearerAuth: [] }],
    params: z.object({
      id: z.string().uuid("Invalid shipping service ID format"),
    }),
    body: updateShippingServiceStatusInputSchema,
    response: {
      200: apiSuccessResponseSchema(shippingServiceResponseSchema).describe("Shipping service status updated successfully"),
      400: apiErrorResponseSchema.describe("Validation error"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
      403: apiErrorResponseSchema.describe("Forbidden"),
      404: apiErrorResponseSchema.describe("Shipping service not found"),
    },
  },
};

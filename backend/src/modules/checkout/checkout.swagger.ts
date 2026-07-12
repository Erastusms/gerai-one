import { z } from "zod";
import {
  createCheckoutInputSchema,
  checkoutSuccessResponseSchema,
  blockingValidationResponseSchema,
  checkoutSessionResponseSchema,
  updateCheckoutAddressSchema,
  updateCheckoutShippingSchema,
} from "./checkout.schema";
import { apiSuccessResponseSchema, apiErrorResponseSchema } from "../auth/auth.schema";

export const createCheckoutSwagger = {
  schema: {
    description: "Validate cart and create a checkout session (Authenticated users only)",
    tags: ["Checkout"],
    summary: "Create checkout session",
    security: [{ BearerAuth: [] }],
    body: createCheckoutInputSchema,
    response: {
      201: apiSuccessResponseSchema(checkoutSuccessResponseSchema).describe("Checkout session created successfully"),
      400: blockingValidationResponseSchema.describe("Blocking validation errors (Product inactive, insufficient stock, etc.)"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
    },
  },
};

export const listCheckoutsSwagger = {
  schema: {
    description: "Retrieve a list of all checkout sessions for the current user (Authenticated users only)",
    tags: ["Checkout"],
    summary: "List user checkout sessions",
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(z.array(checkoutSessionResponseSchema)).describe("Checkout list retrieved successfully"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
    },
  },
};

const checkoutParamsSchema = z.object({
  idOrOrderNumber: z.string().min(1, "Checkout ID or Order Number is required"),
});

export const getCheckoutSwagger = {
  schema: {
    description: "Retrieve details of a checkout session (Authenticated users only)",
    tags: ["Checkout"],
    summary: "Get checkout session details",
    security: [{ BearerAuth: [] }],
    params: checkoutParamsSchema,
    response: {
      200: apiSuccessResponseSchema(checkoutSessionResponseSchema).describe("Checkout session retrieved successfully"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
      404: apiErrorResponseSchema.describe("Checkout session not found"),
    },
  },
};

export const cancelCheckoutSwagger = {
  schema: {
    description: "Cancel a checkout session and release reserved stock (Authenticated users only)",
    tags: ["Checkout"],
    summary: "Cancel checkout session",
    security: [{ BearerAuth: [] }],
    params: checkoutParamsSchema,
    response: {
      200: apiSuccessResponseSchema(z.null()).describe("Checkout session cancelled successfully"),
      400: apiErrorResponseSchema.describe("Session not in pending status"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
      404: apiErrorResponseSchema.describe("Checkout session not found"),
    },
  },
};

export const updateCheckoutAddressSwagger = {
  schema: {
    description: "Snapshot a shipping address from user profile onto the checkout session (Authenticated users only)",
    tags: ["Checkout"],
    summary: "Update checkout shipping address snapshot",
    security: [{ BearerAuth: [] }],
    params: checkoutParamsSchema,
    body: updateCheckoutAddressSchema,
    response: {
      200: apiSuccessResponseSchema(checkoutSessionResponseSchema).describe("Checkout shipping address snapshot updated successfully"),
      400: apiErrorResponseSchema.describe("Validation errors or invalid session status"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
      403: apiErrorResponseSchema.describe("Access forbidden"),
      404: apiErrorResponseSchema.describe("Checkout session or Address not found"),
    },
  },
};

export const updateCheckoutShippingSwagger = {
  schema: {
    description: "Snapshot selected shipping service details onto the checkout session (Authenticated users only)",
    tags: ["Checkout"],
    summary: "Update checkout shipping service snapshot",
    security: [{ BearerAuth: [] }],
    params: checkoutParamsSchema,
    body: updateCheckoutShippingSchema,
    response: {
      200: apiSuccessResponseSchema(checkoutSessionResponseSchema).describe("Checkout shipping service snapshot updated successfully"),
      400: apiErrorResponseSchema.describe("Validation errors or invalid session status"),
      401: apiErrorResponseSchema.describe("Unauthorized"),
      403: apiErrorResponseSchema.describe("Access forbidden"),
      404: apiErrorResponseSchema.describe("Checkout session or Shipping Service not found"),
    },
  },
};

import { z } from "zod";
import { userResponseSchema, apiSuccessResponseSchema, apiErrorResponseSchema } from "./auth.schema";

export const webhookSwagger = {
  schema: {
    description: "Endpoint to receive and process Clerk identity webhook events",
    tags: ["Auth"],
    summary: "Clerk identity webhook receiver",
    headers: z.object({
      "svix-id": z.string().describe("Svix unique message identifier"),
      "svix-timestamp": z.string().describe("Svix timestamp of delivery"),
      "svix-signature": z.string().describe("Svix cryptographic signature value"),
    }),
    response: {
      200: apiSuccessResponseSchema(
        userResponseSchema.nullable()
      ).describe("User synchronized successfully"),
      400: apiErrorResponseSchema.describe("Validation or parameter error"),
      401: apiErrorResponseSchema.describe("Webhook signature verification failed"),
    },
  },
};

export const meSwagger = {
  schema: {
    description: "Get authenticated user details from session JWT token",
    tags: ["Auth"],
    summary: "Get current user profile details",
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(userResponseSchema).describe("Current profile details"),
      401: apiErrorResponseSchema.describe("Authentication token missing or invalid"),
    },
  },
};

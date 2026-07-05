import { updateProfileSchema, profileResponseSchema } from "./user.schema";
import { apiSuccessResponseSchema, apiErrorResponseSchema } from "../auth/auth.schema";

export const getProfileSwagger = {
  schema: {
    description: "Retrieve details of the currently authenticated user profile",
    tags: ["Profile"],
    summary: "Get current user profile",
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(profileResponseSchema).describe("User profile retrieved"),
      401: apiErrorResponseSchema.describe("Invalid session token"),
    },
  },
};

export const updateProfileSwagger = {
  schema: {
    description: "Update details of the currently authenticated user profile",
    tags: ["Profile"],
    summary: "Update current user profile",
    security: [{ BearerAuth: [] }],
    body: updateProfileSchema,
    response: {
      200: apiSuccessResponseSchema(profileResponseSchema).describe("User profile updated successfully"),
      400: apiErrorResponseSchema.describe("Validation errors in input parameters"),
      401: apiErrorResponseSchema.describe("Invalid session token"),
    },
  },
};

export const deleteProfileSwagger = {
  schema: {
    description: "Soft delete the profile of the currently authenticated user",
    tags: ["Profile"],
    summary: "Soft delete current user profile",
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(profileResponseSchema).describe("Profile soft deleted successfully"),
      401: apiErrorResponseSchema.describe("Invalid session token"),
    },
  },
};


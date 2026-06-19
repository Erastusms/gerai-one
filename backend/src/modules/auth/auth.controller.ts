import { FastifyRequest, FastifyReply } from "fastify";
import { authService } from "./auth.service";
import { createSuccessResponse } from "../../shared/responses";
import { UnauthorizedException } from "../../shared/exceptions";

export class AuthController {
  // Handles Clerk Webhooks and synchronizes user profiles
  async handleClerkWebhook(request: FastifyRequest, reply: FastifyReply) {
    const rawBody = request.rawBody;
    const headers = request.headers as Record<string, string>;

    if (!rawBody) {
      throw new UnauthorizedException("Raw request body is missing");
    }

    const rawBodyString = typeof rawBody === "string" ? rawBody : rawBody.toString("utf8");

    // Verify webhook signature
    const event = authService.verifyWebhook(rawBodyString, headers);

    // Sync database
    const user = await authService.syncClerkUser(event.type, event.data);

    return reply.status(200).send(
      createSuccessResponse("User sync completed successfully", user)
    );
  }

  // Returns currently authenticated user details
  async handleMe(request: FastifyRequest, reply: FastifyReply) {
    const currentUser = request.user;
    if (!currentUser) {
      throw new UnauthorizedException("Authenticated user context is missing");
    }

    return reply.status(200).send(
      createSuccessResponse("Profile retrieved successfully", currentUser)
    );
  }
}

export const authController = new AuthController();

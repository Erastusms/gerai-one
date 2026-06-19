import { FastifyRequest, FastifyReply } from "fastify";
import { userService } from "./user.service";
import { UpdateProfileInput } from "./user.schema";
import { createSuccessResponse } from "../../shared/responses";
import { UnauthorizedException } from "../../shared/exceptions";

export class UserController {
  // Retrieves the profile of the current logged-in user
  async handleGetProfile(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException("Authenticated user context is missing");
    }

    return reply.status(200).send(
      createSuccessResponse("Profile retrieved successfully", user)
    );
  }

  // Updates the profile of the current logged-in user
  async handleUpdateProfile(
    request: FastifyRequest<{ Body: UpdateProfileInput }>,
    reply: FastifyReply
  ) {
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException("Authenticated user context is missing");
    }

    const updatedUser = await userService.updateProfile(user.id, request.body);

    return reply.status(200).send(
      createSuccessResponse("Profile updated successfully", updatedUser)
    );
  }

  // Soft deletes the profile of the current logged-in user
  async handleDeleteProfile(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException("Authenticated user context is missing");
    }

    const deletedUser = await userService.softDeleteProfile(user.id);

    return reply.status(200).send(
      createSuccessResponse("Profile deleted successfully", deletedUser)
    );
  }
}

export const userController = new UserController();

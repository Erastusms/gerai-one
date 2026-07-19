import { FastifyRequest, FastifyReply } from "fastify";
import { userService } from "./user.service";
import { UpdateProfileInput, AdminUserListQuery } from "./user.schema";
import { createSuccessResponse } from "../../shared/responses";
import { UnauthorizedException } from "../../shared/exceptions";

// Helper to map DB user model to response schema format
function mapToProfileResponse(user: any) {
  return {
    id: user.id,
    clerkUserId: user.clerkId,
    email: user.email,
    fullName: user.fullName,
    username: user.username,
    phoneNumber: user.phoneNumber,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().split("T")[0] : null,
    profilePhoto: user.profilePhoto || user.imageUrl,
    isProfileCompleted: user.isProfileCompleted,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export class UserController {
  // Retrieves the profile of the current logged-in user
  async handleGetProfile(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException("Authenticated user context is missing");
    }

    // Refresh user from database to ensure up-to-date values
    const latestUser = await userService.getProfile(user.id);

    return reply.status(200).send(
      createSuccessResponse("Profile retrieved successfully", mapToProfileResponse(latestUser))
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
      createSuccessResponse("Profile updated successfully", mapToProfileResponse(updatedUser))
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
      createSuccessResponse("Profile deleted successfully", mapToProfileResponse(deletedUser))
    );
  }

  // Admin: Retrieves list of all registered users
  async handleAdminListUsers(
    request: FastifyRequest<{ Querystring: AdminUserListQuery }>,
    reply: FastifyReply
  ) {
    const { users, meta } = await userService.getAdminUserList(request.query);
    const mappedUsers = users.map(mapToProfileResponse);

    return reply.status(200).send(
      createSuccessResponse("Users retrieved successfully", {
        users: mappedUsers,
        meta,
      })
    );
  }
}

export const userController = new UserController();


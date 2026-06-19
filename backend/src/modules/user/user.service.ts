import { userRepository } from "./user.repository";
import { UpdateProfileInput } from "./user.schema";
import { prisma } from "../../shared/database";
import { NotFoundException } from "../../shared/exceptions";
import { User, Prisma } from "@prisma/client";

export class UserService {
  // Updates user profile details and derives the full name
  async updateProfile(userId: string, input: UpdateProfileInput): Promise<User> {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser || existingUser.deletedAt) {
      throw new NotFoundException("User profile not found");
    }

    // Merge names to recalculate fullName
    const firstName = input.firstName !== undefined ? input.firstName : existingUser.firstName;
    const lastName = input.lastName !== undefined ? input.lastName : existingUser.lastName;
    const fullName = firstName && lastName
      ? `${firstName} ${lastName}`.trim()
      : firstName || lastName || null;

    const dbPayload: Prisma.UserUpdateInput = {
      firstName,
      lastName,
      fullName,
      imageUrl: input.imageUrl !== undefined ? input.imageUrl : existingUser.imageUrl,
      phoneNumber: input.phoneNumber !== undefined ? input.phoneNumber : existingUser.phoneNumber,
    };

    return userRepository.updateProfile(userId, dbPayload);
  }

  // Performs a soft delete on the user profile
  async softDeleteProfile(userId: string): Promise<User> {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser || existingUser.deletedAt) {
      throw new NotFoundException("User profile not found");
    }

    return userRepository.softDeleteProfile(userId);
  }
}

export const userService = new UserService();

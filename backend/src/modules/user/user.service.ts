import { userRepository } from "./user.repository";
import { UpdateProfileInput } from "./user.schema";
import { prisma } from "../../shared/database";
import { NotFoundException, ConflictException } from "../../shared/exceptions";
import { User, Prisma } from "@prisma/client";

export class UserService {
  // Retrieves the user profile by ID
  async getProfile(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException("User profile not found");
    }

    return user;
  }

  // Updates user profile details
  async updateProfile(userId: string, input: UpdateProfileInput): Promise<User> {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser || existingUser.deletedAt) {
      throw new NotFoundException("User profile not found");
    }

    // Check username uniqueness if changing
    if (input.username) {
      const existingUsername = await prisma.user.findFirst({
        where: {
          username: {
            equals: input.username,
            mode: "insensitive",
          },
          NOT: {
            id: userId,
          },
        },
      });

      if (existingUsername) {
        throw new ConflictException("Username is already taken");
      }
    }

    const dbPayload: Prisma.UserUpdateInput = {
      fullName: input.fullName !== undefined ? input.fullName : existingUser.fullName,
      username: input.username !== undefined ? input.username : existingUser.username,
      phoneNumber: input.phoneNumber !== undefined ? input.phoneNumber : existingUser.phoneNumber,
      gender: input.gender !== undefined ? input.gender : existingUser.gender,
      dateOfBirth: input.dateOfBirth !== undefined 
        ? (input.dateOfBirth ? new Date(input.dateOfBirth) : null)
        : existingUser.dateOfBirth,
      profilePhoto: input.profilePhoto !== undefined ? input.profilePhoto : existingUser.profilePhoto,
      isProfileCompleted: input.isProfileCompleted !== undefined ? input.isProfileCompleted : existingUser.isProfileCompleted,
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


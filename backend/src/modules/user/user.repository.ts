import { prisma } from "../../shared/database";
import { Prisma, User } from "@prisma/client";

export class UserRepository {
  async updateProfile(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async softDeleteProfile(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "INACTIVE",
      },
    });
  }
}

export const userRepository = new UserRepository();

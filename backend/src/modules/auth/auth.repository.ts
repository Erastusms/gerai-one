import { prisma } from "../../shared/database";
import { Prisma, User } from "@prisma/client";

export class AuthRepository {
  async findByClerkId(clerkId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { clerkId },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async updateUserByClerkId(clerkId: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { clerkId },
      data,
    });
  }

  async upsertUserByClerkId(clerkId: string, data: Prisma.UserCreateInput): Promise<User> {
    const { createdAt, ...updateData } = data;
    return prisma.user.upsert({
      where: { clerkId },
      update: updateData,
      create: data,
    });
  }

  async softDeleteByClerkId(clerkId: string): Promise<User> {
    return prisma.user.update({
      where: { clerkId },
      data: {
        deletedAt: new Date(),
        status: "INACTIVE",
      },
    });
  }
}
export const authRepository = new AuthRepository();

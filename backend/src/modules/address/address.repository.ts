import { prisma } from "../../shared/database";
import { Prisma, Address } from "@prisma/client";

export class AddressRepository {
  // Find all non-deleted addresses for a user
  async findManyByUserId(userId: string): Promise<Address[]> {
    return prisma.address.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    });
  }

  // Find address by ID
  async findById(id: string): Promise<Address | null> {
    return prisma.address.findUnique({
      where: { id },
    });
  }

  // Create new address
  async create(data: Prisma.AddressCreateInput): Promise<Address> {
    return prisma.address.create({
      data,
    });
  }

  // Update address
  async update(id: string, data: Prisma.AddressUpdateInput): Promise<Address> {
    return prisma.address.update({
      where: { id },
      data,
    });
  }

  // Set all user addresses isDefault to false
  async unsetDefaultsForUser(userId: string): Promise<Prisma.BatchPayload> {
    return prisma.address.updateMany({
      where: {
        userId,
        isDeleted: false,
      },
      data: {
        isDefault: false,
      },
    });
  }

  // Count active addresses for a user
  async countActiveByUser(userId: string): Promise<number> {
    return prisma.address.count({
      where: {
        userId,
        isDeleted: false,
      },
    });
  }
}

export const addressRepository = new AddressRepository();

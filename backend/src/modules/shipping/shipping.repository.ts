import { prisma } from "../../shared/database";
import { Prisma } from "@prisma/client";

export class ShippingRepository {
  async create(data: Prisma.ShippingServiceCreateInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.shippingService.create({ data });
  }

  async update(id: string, data: Prisma.ShippingServiceUpdateInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.shippingService.update({
      where: { id },
      data,
    });
  }

  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.shippingService.findUnique({
      where: { id },
    });
  }

  async findByCode(code: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.shippingService.findUnique({
      where: { code },
    });
  }

  async findAll(where?: Prisma.ShippingServiceWhereInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.shippingService.findMany({
      where,
      orderBy: [
        { displayOrder: "asc" },
        { name: "asc" },
      ],
    });
  }
}

export const shippingRepository = new ShippingRepository();

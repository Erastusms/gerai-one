import { prisma } from "../../shared/database";
import { Prisma, Brand } from "@prisma/client";

export class BrandRepository {
  async create(data: Prisma.BrandCreateInput): Promise<Brand> {
    return prisma.brand.create({ data });
  }

  async update(id: string, data: Prisma.BrandUpdateInput): Promise<Brand> {
    return prisma.brand.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Brand> {
    return prisma.brand.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  async findById(id: string, includeDeleted = false): Promise<Brand | null> {
    return prisma.brand.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  async findBySlug(slug: string, includeDeleted = false): Promise<Brand | null> {
    return prisma.brand.findFirst({
      where: {
        slug,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  async findMany(options: {
    skip: number;
    limit: number;
    onlyActive?: boolean;
  }): Promise<Brand[]> {
    const whereClause: Prisma.BrandWhereInput = {
      deletedAt: null,
      ...(options.onlyActive ? { isActive: true } : {}),
    };

    return prisma.brand.findMany({
      where: whereClause,
      skip: options.skip,
      take: options.limit,
      orderBy: { name: "asc" },
    });
  }

  async count(options: { onlyActive?: boolean }): Promise<number> {
    const whereClause: Prisma.BrandWhereInput = {
      deletedAt: null,
      ...(options.onlyActive ? { isActive: true } : {}),
    };

    return prisma.brand.count({
      where: whereClause,
    });
  }

  async findProductsByBrandId(
    brandId: string,
    options: { skip: number; limit: number }
  ) {
    return prisma.product.findMany({
      where: { brandId, deletedAt: null, isActive: true },
      skip: options.skip,
      take: options.limit,
      orderBy: { createdAt: "desc" },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        specifications: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async countProductsByBrandId(brandId: string): Promise<number> {
    return prisma.product.count({
      where: { brandId, deletedAt: null, isActive: true },
    });
  }
}

export const brandRepository = new BrandRepository();

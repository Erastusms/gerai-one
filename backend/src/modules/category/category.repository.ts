import { prisma } from "../../shared/database";
import { Prisma, Category } from "@prisma/client";

export interface CategoryWithProductCount extends Category {
  productCount: number;
}

export class CategoryRepository {
  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return prisma.category.create({ data });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  async findById(id: string, includeDeleted = false): Promise<Category | null> {
    return prisma.category.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  async findBySlug(slug: string, includeDeleted = false): Promise<Category | null> {
    return prisma.category.findFirst({
      where: {
        slug,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  async findManyWithCount(options: {
    skip: number;
    limit: number;
    onlyActive?: boolean;
  }): Promise<CategoryWithProductCount[]> {
    const whereClause: Prisma.CategoryWhereInput = {
      deletedAt: null,
      ...(options.onlyActive ? { isActive: true } : {}),
    };

    const categories = await prisma.category.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      skip: options.skip,
      take: options.limit,
      orderBy: { name: "asc" },
    });

    return categories.map((c) => ({
      ...c,
      productCount: c._count.products,
    }));
  }

  async count(options: { onlyActive?: boolean }): Promise<number> {
    const whereClause: Prisma.CategoryWhereInput = {
      deletedAt: null,
      ...(options.onlyActive ? { isActive: true } : {}),
    };

    return prisma.category.count({
      where: whereClause,
    });
  }
}

export const categoryRepository = new CategoryRepository();

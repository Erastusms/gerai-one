import { prisma } from "../../shared/database";
import { Prisma, Product } from "@prisma/client";
import { CreateProductInput, UpdateProductInput } from "./product.schema";

export interface ProductFindManyOptions {
  skip?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  isFeatured?: boolean;
  sort?: "newest" | "oldest" | "priceAsc" | "priceDesc" | "nameAsc" | "nameDesc";
  onlyActive?: boolean;
}

export class ProductRepository {
  private get defaultInclude() {
    return {
      images: {
        orderBy: {
          sortOrder: "asc" as const,
        },
      },
      specifications: true,
      categories: {
        include: {
          category: true,
        },
      },
    };
  }

  async create(data: CreateProductInput): Promise<Product> {
    return prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        slug: data.slug,
        shortDescription: data.shortDescription,
        description: data.description,
        brand: data.brand,
        price: new Prisma.Decimal(data.price),
        discountPrice: data.discountPrice !== undefined && data.discountPrice !== null 
          ? new Prisma.Decimal(data.discountPrice) 
          : null,
        weight: data.weight,
        thumbnailUrl: data.thumbnailUrl,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        images: data.images
          ? {
              create: data.images,
            }
          : undefined,
        specifications: data.specifications
          ? {
              create: data.specifications,
            }
          : undefined,
        categories: data.categoryIds
          ? {
              create: data.categoryIds.map((categoryId) => ({ categoryId })),
            }
          : undefined,
      },
      include: this.defaultInclude,
    });
  }

  async update(id: string, data: UpdateProductInput): Promise<Product> {
    return prisma.$transaction(async (tx) => {
      // 1. Delete existing relationships if replacement arrays are explicitly provided
      if (data.images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
      }
      if (data.specifications !== undefined) {
        await tx.productSpecification.deleteMany({ where: { productId: id } });
      }
      if (data.categoryIds !== undefined) {
        await tx.productCategory.deleteMany({ where: { productId: id } });
      }

      // 2. Perform main product update and recreate relationships if provided
      return tx.product.update({
        where: { id },
        data: {
          sku: data.sku,
          name: data.name,
          slug: data.slug,
          shortDescription: data.shortDescription,
          description: data.description,
          brand: data.brand,
          price: data.price !== undefined ? new Prisma.Decimal(data.price) : undefined,
          discountPrice: data.discountPrice !== undefined
            ? (data.discountPrice !== null ? new Prisma.Decimal(data.discountPrice) : null)
            : undefined,
          weight: data.weight,
          thumbnailUrl: data.thumbnailUrl,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          images: data.images
            ? {
                create: data.images,
              }
            : undefined,
          specifications: data.specifications
            ? {
                create: data.specifications,
              }
            : undefined,
          categories: data.categoryIds
            ? {
                create: data.categoryIds.map((categoryId) => ({ categoryId })),
              }
            : undefined,
        },
        include: this.defaultInclude,
      });
    });
  }

  async softDelete(id: string): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
      include: this.defaultInclude,
    });
  }

  async findById(id: string, includeDeleted = false): Promise<Product | null> {
    return prisma.product.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: this.defaultInclude,
    });
  }

  async findBySlug(slug: string, includeDeleted = false): Promise<Product | null> {
    return prisma.product.findFirst({
      where: {
        slug,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: this.defaultInclude,
    });
  }

  async findBySku(sku: string, includeDeleted = false): Promise<Product | null> {
    return prisma.product.findFirst({
      where: {
        sku,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: this.defaultInclude,
    });
  }

  private buildWhereClause(options: ProductFindManyOptions): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
    };

    if (options.onlyActive) {
      where.isActive = true;
    }

    if (options.isFeatured !== undefined) {
      where.isFeatured = options.isFeatured;
    }

    if (options.brand) {
      where.brand = { equals: options.brand, mode: "insensitive" };
    }

    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      where.price = {};
      if (options.minPrice !== undefined) {
        where.price.gte = new Prisma.Decimal(options.minPrice);
      }
      if (options.maxPrice !== undefined) {
        where.price.lte = new Prisma.Decimal(options.maxPrice);
      }
    }

    if (options.categoryId) {
      where.categories = {
        some: {
          categoryId: options.categoryId,
        },
      };
    } else if (options.categorySlug) {
      where.categories = {
        some: {
          category: {
            slug: options.categorySlug,
          },
        },
      };
    }

    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: "insensitive" } },
        { sku: { contains: options.search, mode: "insensitive" } },
        { brand: { contains: options.search, mode: "insensitive" } },
        {
          categories: {
            some: {
              category: {
                name: { contains: options.search, mode: "insensitive" },
              },
            },
          },
        },
      ];
    }

    return where;
  }

  private buildOrderByClause(
    sort?: "newest" | "oldest" | "priceAsc" | "priceDesc" | "nameAsc" | "nameDesc"
  ): Prisma.ProductOrderByWithRelationInput {
    switch (sort) {
      case "oldest":
        return { createdAt: "asc" };
      case "priceAsc":
        return { price: "asc" };
      case "priceDesc":
        return { price: "desc" };
      case "nameAsc":
        return { name: "asc" };
      case "nameDesc":
        return { name: "desc" };
      case "newest":
      default:
        return { createdAt: "desc" };
    }
  }

  async findMany(options: ProductFindManyOptions): Promise<Product[]> {
    const where = this.buildWhereClause(options);
    const orderBy = this.buildOrderByClause(options.sort);

    return prisma.product.findMany({
      where,
      orderBy,
      skip: options.skip,
      take: options.limit,
      include: this.defaultInclude,
    });
  }

  async count(options: Omit<ProductFindManyOptions, "skip" | "limit" | "sort">): Promise<number> {
    const where = this.buildWhereClause(options);
    return prisma.product.count({ where });
  }
}

export const productRepository = new ProductRepository();

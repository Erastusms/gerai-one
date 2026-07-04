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
      brand: true,
      seo: true,
      variants: {
        where: { deletedAt: null, isActive: true },
        include: {
          inventory: true,
          attributeValues: {
            include: {
              attributeValue: {
                include: {
                  attribute: true
                }
              }
            }
          }
        }
      }
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
        brandId: data.brandId,
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
          brandId: data.brandId,
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
      where.brand = {
        OR: [
          { slug: { equals: options.brand, mode: "insensitive" } },
          { name: { equals: options.brand, mode: "insensitive" } }
        ]
      };
    }

    const andConditions: Prisma.ProductWhereInput[] = [];

    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      const minVal = options.minPrice !== undefined ? new Prisma.Decimal(options.minPrice) : undefined;
      const maxVal = options.maxPrice !== undefined ? new Prisma.Decimal(options.maxPrice) : undefined;

      andConditions.push({
        OR: [
          {
            discountPrice: { not: null },
            AND: [
              ...(minVal !== undefined ? [{ discountPrice: { gte: minVal } }] : []),
              ...(maxVal !== undefined ? [{ discountPrice: { lte: maxVal } }] : []),
            ],
          },
          {
            discountPrice: null,
            AND: [
              ...(minVal !== undefined ? [{ price: { gte: minVal } }] : []),
              ...(maxVal !== undefined ? [{ price: { lte: maxVal } }] : []),
            ],
          },
        ]
      });
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
      andConditions.push({
        OR: [
          { name: { contains: options.search, mode: "insensitive" } },
          { sku: { contains: options.search, mode: "insensitive" } },
          {
            brand: {
              name: { contains: options.search, mode: "insensitive" }
            }
          },
          {
            categories: {
              some: {
                category: {
                  name: { contains: options.search, mode: "insensitive" },
                },
              },
            },
          },
        ]
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
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

  async getFilterOptions(search?: string): Promise<{ categories: any[]; brands: any[] }> {
    if (!search) {
      const [brands, categories] = await Promise.all([
        prisma.brand.findMany({
          where: { isActive: true, deletedAt: null },
          select: { id: true, name: true, slug: true },
        }),
        prisma.category.findMany({
          where: { isActive: true, deletedAt: null },
          select: { id: true, name: true, slug: true },
        }),
      ]);
      return { categories, brands };
    }

    const searchWhere: Prisma.ProductWhereInput = {
      deletedAt: null,
      isActive: true,
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        {
          brand: {
            name: { contains: search, mode: "insensitive" }
          }
        },
        {
          categories: {
            some: {
              category: {
                name: { contains: search, mode: "insensitive" },
              },
            },
          },
        },
      ],
    };

    const products = await prisma.product.findMany({
      where: searchWhere,
      select: {
        brand: {
          select: { id: true, name: true, slug: true, isActive: true, deletedAt: true },
        },
        categories: {
          select: {
            category: {
              select: { id: true, name: true, slug: true, isActive: true, deletedAt: true },
            },
          },
        },
      },
    });

    const categoryMap = new Map<string, { id: string; name: string; slug: string; productCount: number }>();
    const brandMap = new Map<string, { id: string; name: string; slug: string; productCount: number }>();

    for (const p of products) {
      if (p.brand && p.brand.isActive && p.brand.deletedAt === null) {
        const existing = brandMap.get(p.brand.id);
        brandMap.set(p.brand.id, {
          id: p.brand.id,
          name: p.brand.name,
          slug: p.brand.slug,
          productCount: (existing?.productCount || 0) + 1,
        });
      }
      for (const pc of p.categories) {
        if (pc.category && pc.category.isActive && pc.category.deletedAt === null) {
          const existing = categoryMap.get(pc.category.id);
          categoryMap.set(pc.category.id, {
            id: pc.category.id,
            name: pc.category.name,
            slug: pc.category.slug,
            productCount: (existing?.productCount || 0) + 1,
          });
        }
      }
    }

    return {
      categories: Array.from(categoryMap.values()),
      brands: Array.from(brandMap.values()),
    };
  }

  async incrementViewCount(id: string): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }
}

export const productRepository = new ProductRepository();

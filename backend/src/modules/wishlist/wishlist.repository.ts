import { prisma } from "../../shared/database";
import { Wishlist } from "@prisma/client";

export class WishlistRepository {
  async create(userId: string, productId: string): Promise<Wishlist> {
    return prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
    });
  }

  async delete(userId: string, productId: string): Promise<Wishlist> {
    const item = await prisma.wishlist.findFirst({
      where: { userId, productId },
    });

    if (!item) {
      throw new Error("Wishlist item not found");
    }

    return prisma.wishlist.delete({
      where: { id: item.id },
    });
  }

  async findByUserAndProduct(userId: string, productId: string): Promise<Wishlist | null> {
    return prisma.wishlist.findFirst({
      where: { userId, productId },
    });
  }

  async findManyByUserId(
    userId: string,
    options: { skip: number; limit: number }
  ) {
    return prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            brand: true,
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
        },
      },
      skip: options.skip,
      take: options.limit,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return prisma.wishlist.count({
      where: { userId },
    });
  }
}

export const wishlistRepository = new WishlistRepository();

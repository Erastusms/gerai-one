import { prisma } from "../../shared/database";
import { Review } from "@prisma/client";

export class ReviewRepository {
  async create(data: {
    productId: string;
    userId: string;
    rating: number;
    comment?: string | null;
  }): Promise<Review> {
    return prisma.review.create({
      data: {
        productId: data.productId,
        userId: data.userId,
        rating: data.rating,
        comment: data.comment || null,
        isVerifiedPurchase: false,
        helpfulCount: 0,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            imageUrl: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: { rating?: number; comment?: string | null }
  ): Promise<Review> {
    return prisma.review.update({
      where: { id },
      data: {
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            imageUrl: true,
          },
        },
      },
    });
  }

  async softDelete(id: string): Promise<Review> {
    return prisma.review.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async findById(id: string): Promise<Review | null> {
    return prisma.review.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findByProductAndUser(productId: string, userId: string): Promise<Review | null> {
    return prisma.review.findFirst({
      where: {
        productId,
        userId,
        deletedAt: null,
      },
    });
  }

  async findManyByProductId(
    productId: string,
    options: { skip: number; limit: number }
  ): Promise<Review[]> {
    return prisma.review.findMany({
      where: {
        productId,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            imageUrl: true,
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

  async countByProductId(productId: string): Promise<number> {
    return prisma.review.count({
      where: {
        productId,
        deletedAt: null,
      },
    });
  }
}

export const reviewRepository = new ReviewRepository();

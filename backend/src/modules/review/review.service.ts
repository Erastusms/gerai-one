import { reviewRepository } from "./review.repository";
import { productRepository } from "../product/product.repository";
import { CreateReviewInput, UpdateReviewInput } from "./review.schema";
import { ConflictException, NotFoundException, ForbiddenException } from "../../shared/exceptions";
import { getPaginationParams, createPaginationMeta } from "../../shared/utils/pagination";
import { Review } from "@prisma/client";

export class ReviewService {
  async createReview(userId: string, input: CreateReviewInput): Promise<Review> {
    // 1. Verify product exists
    const product = await productRepository.findById(input.productId);
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    // 2. Verify user hasn't already reviewed this product
    const existing = await reviewRepository.findByProductAndUser(input.productId, userId);
    if (existing) {
      throw new ConflictException("User has already reviewed this product once");
    }

    // 3. Create review
    return reviewRepository.create({
      productId: input.productId,
      userId,
      rating: input.rating,
      comment: input.comment,
    });
  }

  async updateReview(
    id: string,
    userId: string,
    input: UpdateReviewInput
  ): Promise<Review> {
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundException("Review not found");
    }

    // Verify ownership
    if (review.userId !== userId) {
      throw new ForbiddenException("You can only modify your own reviews");
    }

    return reviewRepository.update(id, input);
  }

  async softDeleteReview(id: string, userId: string): Promise<Review> {
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundException("Review not found");
    }

    // Verify ownership
    if (review.userId !== userId) {
      throw new ForbiddenException("You can only delete your own reviews");
    }

    return reviewRepository.softDelete(id);
  }

  async getReviewsForProduct(productId: string, options: { page?: number; limit?: number }) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const { page, limit, skip } = getPaginationParams(options);

    const [reviews, totalItems] = await Promise.all([
      reviewRepository.findManyByProductId(productId, { skip, limit }),
      reviewRepository.countByProductId(productId),
    ]);

    const meta = createPaginationMeta(totalItems, page, limit);

    return {
      reviews,
      meta,
    };
  }
}

export const reviewService = new ReviewService();

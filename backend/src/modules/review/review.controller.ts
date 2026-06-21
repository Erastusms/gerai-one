import { FastifyRequest, FastifyReply } from "fastify";
import { reviewService } from "./review.service";
import { CreateReviewInput, UpdateReviewInput, ReviewSearchQuery } from "./review.schema";
import { createSuccessResponse } from "../../shared/responses";

export class ReviewController {
  async handleCreateReview(
    request: FastifyRequest<{ Body: CreateReviewInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.id;
    const review = await reviewService.createReview(userId, request.body);
    return reply.status(201).send(
      createSuccessResponse("Review created successfully", review)
    );
  }

  async handleUpdateReview(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateReviewInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.id;
    const { id } = request.params;
    const review = await reviewService.updateReview(id, userId, request.body);
    return reply.status(200).send(
      createSuccessResponse("Review updated successfully", review)
    );
  }

  async handleDeleteReview(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.id;
    const { id } = request.params;
    const review = await reviewService.softDeleteReview(id, userId);
    return reply.status(200).send(
      createSuccessResponse("Review deleted successfully", review)
    );
  }

  async handleGetProductReviews(
    request: FastifyRequest<{ Params: { productId: string }; Querystring: ReviewSearchQuery }>,
    reply: FastifyReply
  ) {
    const { productId } = request.params;
    const { reviews, meta } = await reviewService.getReviewsForProduct(productId, request.query);
    return reply.status(200).send(
      createSuccessResponse("Reviews retrieved successfully", reviews, meta)
    );
  }
}

export const reviewController = new ReviewController();

import { FastifyInstance } from "fastify";
import { reviewController } from "./review.controller";
import {
  createReviewSwagger,
  updateReviewSwagger,
  deleteReviewSwagger,
  getProductReviewsSwagger,
} from "./review.swagger";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";

export async function reviewRoutes(fastify: FastifyInstance) {
  // Public endpoint: get reviews for a product
  fastify.get(
    "/api/v1/products/:productId/reviews",
    {
      schema: getProductReviewsSwagger.schema,
    },
    reviewController.handleGetProductReviews as any
  );

  // Authenticated endpoint: write a review
  fastify.post(
    "/api/v1/reviews",
    {
      schema: createReviewSwagger.schema,
      preHandler: [authMiddleware],
    },
    reviewController.handleCreateReview as any
  );

  // Authenticated endpoint: update review rating/comment
  fastify.put(
    "/api/v1/reviews/:id",
    {
      schema: updateReviewSwagger.schema,
      preHandler: [authMiddleware],
    },
    reviewController.handleUpdateReview as any
  );

  // Authenticated endpoint: delete review
  fastify.delete(
    "/api/v1/reviews/:id",
    {
      schema: deleteReviewSwagger.schema,
      preHandler: [authMiddleware],
    },
    reviewController.handleDeleteReview as any
  );
}

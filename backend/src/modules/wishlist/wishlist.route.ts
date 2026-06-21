import { FastifyInstance } from "fastify";
import { wishlistController } from "./wishlist.controller";
import {
  addToWishlistSwagger,
  removeFromWishlistSwagger,
  getWishlistSwagger,
} from "./wishlist.swagger";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";

export async function wishlistRoutes(fastify: FastifyInstance) {
  // Authenticated endpoint: add product to wishlist
  fastify.post(
    "/api/v1/wishlist",
    {
      schema: addToWishlistSwagger.schema,
      preHandler: [authMiddleware],
    },
    wishlistController.handleAddToWishlist as any
  );

  // Authenticated endpoint: remove product from wishlist
  fastify.delete(
    "/api/v1/wishlist/:productId",
    {
      schema: removeFromWishlistSwagger.schema,
      preHandler: [authMiddleware],
    },
    wishlistController.handleRemoveFromWishlist as any
  );

  // Authenticated endpoint: get user's wishlist
  fastify.get(
    "/api/v1/wishlist",
    {
      schema: getWishlistSwagger.schema,
      preHandler: [authMiddleware],
    },
    wishlistController.handleGetWishlist as any
  );
}

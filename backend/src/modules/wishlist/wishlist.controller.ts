import { FastifyRequest, FastifyReply } from "fastify";
import { wishlistService } from "./wishlist.service";
import { CreateWishlistItemInput, WishlistSearchQuery } from "./wishlist.schema";
import { createSuccessResponse } from "../../shared/responses";
import { mapProductResponse } from "../product/product.controller";

export class WishlistController {
  async handleAddToWishlist(
    request: FastifyRequest<{ Body: CreateWishlistItemInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.id;
    const item = await wishlistService.addToWishlist(userId, request.body);
    return reply.status(201).send(
      createSuccessResponse("Product added to wishlist successfully", item)
    );
  }

  async handleRemoveFromWishlist(
    request: FastifyRequest<{ Params: { productId: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.id;
    const { productId } = request.params;
    const item = await wishlistService.removeFromWishlist(userId, productId);
    return reply.status(200).send(
      createSuccessResponse("Product removed from wishlist successfully", item)
    );
  }

  async handleGetWishlist(
    request: FastifyRequest<{ Querystring: WishlistSearchQuery }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.id;
    const { products, meta } = await wishlistService.getWishlist(userId, request.query);
    const mappedProducts = products.map(mapProductResponse);
    return reply.status(200).send(
      createSuccessResponse("Wishlist retrieved successfully", mappedProducts, meta)
    );
  }
}

export const wishlistController = new WishlistController();

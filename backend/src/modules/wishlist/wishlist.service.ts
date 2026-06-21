import { wishlistRepository } from "./wishlist.repository";
import { productRepository } from "../product/product.repository";
import { CreateWishlistItemInput } from "./wishlist.schema";
import { ConflictException, NotFoundException } from "../../shared/exceptions";
import { getPaginationParams, createPaginationMeta } from "../../shared/utils/pagination";
import { productService } from "../product/product.service";

export class WishlistService {
  async addToWishlist(userId: string, input: CreateWishlistItemInput) {
    const product = await productRepository.findById(input.productId);
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const existing = await wishlistRepository.findByUserAndProduct(userId, input.productId);
    if (existing) {
      throw new ConflictException("Product is already in your wishlist");
    }

    return wishlistRepository.create(userId, input.productId);
  }

  async removeFromWishlist(userId: string, productId: string) {
    try {
      return await wishlistRepository.delete(userId, productId);
    } catch (error) {
      throw new NotFoundException("Product is not in your wishlist");
    }
  }

  async getWishlist(userId: string, options: { page?: number; limit?: number }) {
    const { page, limit, skip } = getPaginationParams(options);

    const [items, totalItems] = await Promise.all([
      wishlistRepository.findManyByUserId(userId, { skip, limit }),
      wishlistRepository.countByUserId(userId),
    ]);

    const meta = createPaginationMeta(totalItems, page, limit);

    // Extract product sub-objects from wishlist items
    const products = items.map((item) => item.product);
    const enrichedProducts = await productService.enrichProductList(products, userId);

    return {
      products: enrichedProducts,
      meta,
    };
  }
}

export const wishlistService = new WishlistService();

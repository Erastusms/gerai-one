import { productRepository, ProductFindManyOptions } from "./product.repository";
import { categoryRepository } from "../category/category.repository";
import { CreateProductInput, UpdateProductInput, ProductSearchQuery } from "./product.schema";
import { ConflictException, NotFoundException } from "../../shared/exceptions";
import { getPaginationParams, createPaginationMeta } from "../../shared/utils/pagination";
import { Product } from "@prisma/client";
import { prisma } from "../../shared/database";

export class ProductService {
  async createProduct(input: CreateProductInput): Promise<Product> {
    // 1. Validate SKU uniqueness
    const skuExists = await productRepository.findBySku(input.sku, true);
    if (skuExists) {
      throw new ConflictException(`Product with SKU "${input.sku}" already exists`);
    }

    // 2. Validate Slug uniqueness
    const slugExists = await productRepository.findBySlug(input.slug, true);
    if (slugExists) {
      throw new ConflictException(`Product with slug "${input.slug}" already exists`);
    }

    // 3. Verify category IDs exist
    if (input.categoryIds && input.categoryIds.length > 0) {
      for (const catId of input.categoryIds) {
        const cat = await categoryRepository.findById(catId);
        if (!cat) {
          throw new NotFoundException(`Category not found for ID: ${catId}`);
        }
      }
    }

    return productRepository.create(input);
  }

  async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    // 1. Validate SKU uniqueness if changing
    if (input.sku && input.sku !== product.sku) {
      const skuExists = await productRepository.findBySku(input.sku, true);
      if (skuExists && skuExists.id !== id) {
        throw new ConflictException(`Product with SKU "${input.sku}" already exists`);
      }
    }

    // 2. Validate Slug uniqueness if changing
    if (input.slug && input.slug !== product.slug) {
      const slugExists = await productRepository.findBySlug(input.slug, true);
      if (slugExists && slugExists.id !== id) {
        throw new ConflictException(`Product with slug "${input.slug}" already exists`);
      }
    }

    // 3. Verify category IDs exist if changing
    if (input.categoryIds && input.categoryIds.length > 0) {
      for (const catId of input.categoryIds) {
        const cat = await categoryRepository.findById(catId);
        if (!cat) {
          throw new NotFoundException(`Category not found for ID: ${catId}`);
        }
      }
    }

    return productRepository.update(id, input);
  }

  async softDeleteProduct(id: string): Promise<Product> {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return productRepository.softDelete(id);
  }

  private mapProductInventory(product: any) {
    if (!product) return product;

    let totalAvailableStock = 0;
    
    const mappedVariants = product.variants?.map((variant: any) => {
      const inventory = variant.inventory;
      const availableStock = inventory?.availableStock || 0;
      const safetyStock = inventory?.safetyStock || 0;
      
      totalAvailableStock += availableStock;

      return {
        ...variant,
        availableStock,
        isOutOfStock: availableStock <= 0,
        isLowStock: availableStock > 0 && availableStock <= safetyStock,
        // Optional: omit the raw inventory object if needed, or keep it
      };
    });

    return {
      ...product,
      variants: mappedVariants,
      availableStock: totalAvailableStock,
      isOutOfStock: totalAvailableStock <= 0,
    };
  }

  async enrichProductList(products: any[], userId?: string) {
    const productIds = products.map(p => p.id);
    if (productIds.length === 0) return [];

    // 1. Fetch review aggregations
    const reviewsAggregation = await prisma.review.groupBy({
      by: ["productId"],
      where: {
        productId: { in: productIds },
        deletedAt: null,
      },
      _avg: { rating: true },
      _count: { _all: true },
    });

    const reviewsMap = new Map<string, { averageRating: number; totalReviews: number }>();
    reviewsAggregation.forEach(agg => {
      reviewsMap.set(agg.productId, {
        averageRating: agg._avg.rating ? parseFloat(agg._avg.rating.toFixed(2)) : 0,
        totalReviews: agg._count._all,
      });
    });

    // 2. Fetch user wishlist status
    let userWishlistProductIds = new Set<string>();
    if (userId) {
      const wishlistEntries = await prisma.wishlist.findMany({
        where: { userId, productId: { in: productIds } },
        select: { productId: true },
      });
      userWishlistProductIds = new Set(wishlistEntries.map(e => e.productId));
    }

    return products.map(product => {
      const reviewData = reviewsMap.get(product.id);
      const mappedProduct = this.mapProductInventory(product);
      return {
        ...mappedProduct,
        averageRating: reviewData?.averageRating ?? 0,
        totalReviews: reviewData?.totalReviews ?? 0,
        wishlistStatus: userId ? userWishlistProductIds.has(product.id) : false,
      };
    });
  }

  async getProductList(query: ProductSearchQuery, userId?: string, onlyActive = true) {
    const { page, limit, skip } = getPaginationParams(query);

    const filterOptions: ProductFindManyOptions = {
      skip,
      limit,
      search: query.search,
      categoryId: query.categoryId,
      categorySlug: query.categorySlug,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      brand: query.brand,
      isFeatured: query.isFeatured,
      sort: query.sort,
      onlyActive,
    };

    const [products, totalItems] = await Promise.all([
      productRepository.findMany(filterOptions),
      productRepository.count(filterOptions),
    ]);

    const meta = createPaginationMeta(totalItems, page, limit);
    const enrichedProducts = await this.enrichProductList(products, userId);

    return {
      products: enrichedProducts,
      meta,
    };
  }

  async getProductBySlug(slug: string, userId?: string, onlyActive = true): Promise<any> {
    const product = await productRepository.findBySlug(slug);
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (onlyActive && !product.isActive) {
      throw new NotFoundException("Product not found or is inactive");
    }

    // 1. Increment view count in background
    await productRepository.incrementViewCount(product.id).catch(err => {
      console.error("Failed to increment product view count:", err);
    });

    // 2. Fetch rating aggregations from Review table
    const reviewsAggregation = await prisma.review.aggregate({
      where: { productId: product.id, deletedAt: null },
      _avg: { rating: true },
      _count: { _all: true },
    });

    const averageRating = reviewsAggregation._avg.rating
      ? parseFloat(reviewsAggregation._avg.rating.toFixed(2))
      : 0;
    const totalReviews = reviewsAggregation._count._all;

    // 3. Fetch wishlist status
    let wishlistStatus = false;
    if (userId) {
      const wishlisted = await prisma.wishlist.findFirst({
        where: { userId, productId: product.id },
      });
      wishlistStatus = !!wishlisted;
    }

    const mappedProduct = this.mapProductInventory(product);

    return {
      ...mappedProduct,
      averageRating,
      totalReviews,
      wishlistStatus,
    };
  }

  /**
   * Retrieves products belonging to a category slug. Supporting Category Detail Page.
   */
  async getProductsByCategorySlug(
    categorySlug: string,
    options: { page?: number; limit?: number },
    userId?: string
  ) {
    const { page, limit, skip } = getPaginationParams(options);

    const filterOptions: ProductFindManyOptions = {
      skip,
      limit,
      categorySlug,
      onlyActive: true,
    };

    const [products, totalItems] = await Promise.all([
      productRepository.findMany(filterOptions),
      productRepository.count(filterOptions),
    ]);

    const meta = createPaginationMeta(totalItems, page, limit);
    const enrichedProducts = await this.enrichProductList(products, userId);

    return {
      products: enrichedProducts,
      meta,
    };
  }
}

export const productService = new ProductService();

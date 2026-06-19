import { productRepository, ProductFindManyOptions } from "./product.repository";
import { categoryRepository } from "../category/category.repository";
import { CreateProductInput, UpdateProductInput, ProductSearchQuery } from "./product.schema";
import { ConflictException, NotFoundException } from "../../shared/exceptions";
import { getPaginationParams, createPaginationMeta } from "../../shared/utils/pagination";
import { Product } from "@prisma/client";

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

  async getProductList(query: ProductSearchQuery, onlyActive = true) {
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

    return {
      products,
      meta,
    };
  }

  async getProductBySlug(slug: string, onlyActive = true): Promise<Product> {
    const product = await productRepository.findBySlug(slug);
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (onlyActive && !product.isActive) {
      throw new NotFoundException("Product not found or is inactive");
    }

    return product;
  }

  /**
   * Retrieves products belonging to a category slug. Supporting Category Detail Page.
   */
  async getProductsByCategorySlug(
    categorySlug: string,
    options: { page?: number; limit?: number }
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

    return {
      products,
      meta,
    };
  }
}

export const productService = new ProductService();

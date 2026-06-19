import { FastifyRequest, FastifyReply } from "fastify";
import { productService } from "./product.service";
import { CreateProductInput, UpdateProductInput, ProductSearchQuery } from "./product.schema";
import { createSuccessResponse } from "../../shared/responses";

// Helper to flatten nested categories and clean up models for responses
export function mapProductResponse(product: any) {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    brand: product.brand,
    price: product.price,
    discountPrice: product.discountPrice,
    weight: product.weight,
    thumbnailUrl: product.thumbnailUrl,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    deletedAt: product.deletedAt,
    images: product.images
      ? product.images.map((img: any) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          sortOrder: img.sortOrder,
        }))
      : [],
    specifications: product.specifications
      ? product.specifications.map((spec: any) => ({
          id: spec.id,
          key: spec.key,
          value: spec.value,
        }))
      : [],
    categories: product.categories
      ? product.categories.map((pc: any) => ({
          id: pc.category.id,
          name: pc.category.name,
          slug: pc.category.slug,
          description: pc.category.description,
          imageUrl: pc.category.imageUrl,
          isActive: pc.category.isActive,
          createdAt: pc.category.createdAt,
          updatedAt: pc.category.updatedAt,
          deletedAt: pc.category.deletedAt,
        }))
      : [],
  };
}

export class ProductController {
  async handleCreateProduct(
    request: FastifyRequest<{ Body: CreateProductInput }>,
    reply: FastifyReply
  ) {
    const product = await productService.createProduct(request.body);
    return reply.status(201).send(
      createSuccessResponse("Product created successfully", mapProductResponse(product))
    );
  }

  async handleUpdateProduct(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateProductInput }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const product = await productService.updateProduct(id, request.body);
    return reply.status(200).send(
      createSuccessResponse("Product updated successfully", mapProductResponse(product))
    );
  }

  async handleDeleteProduct(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const product = await productService.softDeleteProduct(id);
    return reply.status(200).send(
      createSuccessResponse("Product deleted successfully", mapProductResponse(product))
    );
  }

  async handleGetProducts(
    request: FastifyRequest<{ Querystring: ProductSearchQuery }>,
    reply: FastifyReply
  ) {
    const { products, meta } = await productService.getProductList(request.query);
    const mappedProducts = products.map(mapProductResponse);
    return reply.status(200).send(
      createSuccessResponse("Products retrieved successfully", mappedProducts, meta)
    );
  }

  async handleGetProductDetail(
    request: FastifyRequest<{ Params: { slug: string } }>,
    reply: FastifyReply
  ) {
    const { slug } = request.params;
    const product = await productService.getProductBySlug(slug);
    return reply.status(200).send(
      createSuccessResponse("Product details retrieved successfully", mapProductResponse(product))
    );
  }
}

export const productController = new ProductController();

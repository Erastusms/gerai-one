import { FastifyRequest, FastifyReply } from "fastify";
import { productService } from "./product.service";
import { productRepository } from "./product.repository";
import { CreateProductInput, UpdateProductInput, ProductSearchQuery } from "./product.schema";
import { createSuccessResponse } from "../../shared/responses";
import { verifyToken } from "@clerk/backend";
import { config } from "../../shared/config";
import { prisma } from "../../shared/database";

// Helper to extract optional user ID from Clerk JWT header on public routes
export async function getOptionalUserId(request: FastifyRequest): Promise<string | undefined> {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return undefined;
  }
  const token = authHeader.substring(7);
  try {
    const decoded = await verifyToken(token, {
      secretKey: config.CLERK_SECRET_KEY,
    });
    const clerkId = decoded.sub;
    if (!clerkId) return undefined;
    const user = await prisma.user.findFirst({
      where: { clerkId, deletedAt: null },
    });
    return user?.id;
  } catch (error) {
    return undefined;
  }
}

// Helper to flatten nested categories and clean up models for responses
export function mapProductResponse(product: any) {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    brandId: product.brandId,
    price: product.price,
    discountPrice: product.discountPrice,
    weight: product.weight,
    thumbnailUrl: product.thumbnailUrl,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    viewCount: product.viewCount ?? 0,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    deletedAt: product.deletedAt,
    brand: product.brand
      ? {
          id: product.brand.id,
          name: product.brand.name,
          slug: product.brand.slug,
          logoUrl: product.brand.logoUrl,
          isActive: product.brand.isActive,
        }
      : null,
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
    variants: product.variants
      ? product.variants.map((v: any) => ({
          id: v.id,
          sku: v.sku,
          price: v.price,
          stock: v.availableStock !== undefined ? v.availableStock : v.stock,
          availableStock: v.availableStock,
          isOutOfStock: v.isOutOfStock,
          isLowStock: v.isLowStock,
          weight: v.weight,
          isActive: v.isActive,
          attributeValues: v.attributeValues
            ? v.attributeValues.map((av: any) => ({
                attributeValue: {
                  id: av.attributeValue.id,
                  value: av.attributeValue.value,
                  attribute: {
                    id: av.attributeValue.attribute.id,
                    name: av.attributeValue.attribute.name,
                  },
                },
              }))
            : [],
        }))
      : [],
    seo: product.seo
      ? {
          id: product.seo.id,
          seoTitle: product.seo.seoTitle,
          seoDescription: product.seo.seoDescription,
          seoKeywords: product.seo.seoKeywords,
        }
      : null,
    averageRating: product.averageRating ?? 0,
    totalReviews: product.totalReviews ?? 0,
    wishlistStatus: product.wishlistStatus ?? false,
    availableStock: product.availableStock,
    isOutOfStock: product.isOutOfStock,
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
    const userId = await getOptionalUserId(request);
    const { products, meta } = await productService.getProductList(request.query, userId);
    const mappedProducts = products.map(mapProductResponse);
    return reply.status(200).send(
      createSuccessResponse("Products retrieved successfully", mappedProducts, meta)
    );
  }

  async handleGetFilterOptions(
    request: FastifyRequest<{ Querystring: { search?: string } }>,
    reply: FastifyReply
  ) {
    const { search } = request.query;
    const filterOptions = await productRepository.getFilterOptions(search);
    return reply.status(200).send(
      createSuccessResponse("Filter options retrieved successfully", filterOptions)
    );
  }

  async handleGetProductDetail(
    request: FastifyRequest<{ Params: { slug: string } }>,
    reply: FastifyReply
  ) {
    const { slug } = request.params;
    const userId = await getOptionalUserId(request);
    const product = await productService.getProductBySlug(slug, userId);
    return reply.status(200).send(
      createSuccessResponse("Product details retrieved successfully", mapProductResponse(product))
    );
  }
}

export const productController = new ProductController();

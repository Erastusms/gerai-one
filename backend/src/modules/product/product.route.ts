import { FastifyInstance } from "fastify";
import { productController } from "./product.controller";
import {
  getProductsSwagger,
  getProductDetailSwagger,
  createProductSwagger,
  updateProductSwagger,
  deleteProductSwagger,
} from "./product.swagger";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";

export async function productRoutes(fastify: FastifyInstance) {
  // Public listing, search, and filtering
  fastify.get(
    "/api/v1/products",
    {
      schema: getProductsSwagger.schema,
    },
    productController.handleGetProducts as any
  );

  // Public detail by slug
  fastify.get(
    "/api/v1/products/:slug",
    {
      schema: getProductDetailSwagger.schema,
    },
    productController.handleGetProductDetail as any
  );

  // Admin create product
  fastify.post(
    "/api/v1/products",
    {
      schema: createProductSwagger.schema,
      preHandler: [authMiddleware],
    },
    productController.handleCreateProduct as any
  );

  // Admin update product
  fastify.put(
    "/api/v1/products/:id",
    {
      schema: updateProductSwagger.schema,
      preHandler: [authMiddleware],
    },
    productController.handleUpdateProduct as any
  );

  // Admin soft delete product
  fastify.delete(
    "/api/v1/products/:id",
    {
      schema: deleteProductSwagger.schema,
      preHandler: [authMiddleware],
    },
    productController.handleDeleteProduct as any
  );
}

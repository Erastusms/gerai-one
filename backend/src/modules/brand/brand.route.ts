import { FastifyInstance } from "fastify";
import { brandController } from "./brand.controller";
import {
  getBrandsSwagger,
  getBrandDetailSwagger,
  createBrandSwagger,
  updateBrandSwagger,
  deleteBrandSwagger,
} from "./brand.swagger";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";

export async function brandRoutes(fastify: FastifyInstance) {
  // Public endpoint to get all active brands
  fastify.get(
    "/api/v1/brands",
    {
      schema: getBrandsSwagger.schema,
    },
    brandController.handleGetBrands as any
  );

  // Public endpoint to get brand details + paginated products
  fastify.get(
    "/api/v1/brands/:slug",
    {
      schema: getBrandDetailSwagger.schema,
    },
    brandController.handleGetBrandDetail as any
  );

  // Admin endpoint to create a brand
  fastify.post(
    "/api/v1/brands",
    {
      schema: createBrandSwagger.schema,
      preHandler: [authMiddleware],
    },
    brandController.handleCreateBrand as any
  );

  // Admin endpoint to update a brand
  fastify.put(
    "/api/v1/brands/:id",
    {
      schema: updateBrandSwagger.schema,
      preHandler: [authMiddleware],
    },
    brandController.handleUpdateBrand as any
  );

  // Admin endpoint to soft delete a brand
  fastify.delete(
    "/api/v1/brands/:id",
    {
      schema: deleteBrandSwagger.schema,
      preHandler: [authMiddleware],
    },
    brandController.handleDeleteBrand as any
  );
}

import { FastifyInstance } from "fastify";
import { categoryController } from "./category.controller";
import {
  getCategoriesSwagger,
  getCategoryDetailSwagger,
  createCategorySwagger,
  updateCategorySwagger,
  deleteCategorySwagger,
} from "./category.swagger";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";

export async function categoryRoutes(fastify: FastifyInstance) {
  // Public endpoint to get all active categories
  fastify.get(
    "/api/v1/categories",
    {
      schema: getCategoriesSwagger.schema,
    },
    categoryController.handleGetCategories as any
  );

  // Public endpoint to get category details + paginated products
  fastify.get(
    "/api/v1/categories/:slug",
    {
      schema: getCategoryDetailSwagger.schema,
    },
    categoryController.handleGetCategoryDetail as any
  );

  // Admin endpoint to create a category
  fastify.post(
    "/api/v1/categories",
    {
      schema: createCategorySwagger.schema,
      preHandler: [authMiddleware],
    },
    categoryController.handleCreateCategory as any
  );

  // Admin endpoint to update a category
  fastify.put(
    "/api/v1/categories/:id",
    {
      schema: updateCategorySwagger.schema,
      preHandler: [authMiddleware],
    },
    categoryController.handleUpdateCategory as any
  );

  // Admin endpoint to soft delete a category
  fastify.delete(
    "/api/v1/categories/:id",
    {
      schema: deleteCategorySwagger.schema,
      preHandler: [authMiddleware],
    },
    categoryController.handleDeleteCategory as any
  );
}

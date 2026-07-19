import { FastifyInstance } from "fastify"
import { adminCatalogController } from "./admin-catalog.controller"
import {
  getAdminProductsSwagger,
  getAdminProductByIdSwagger,
  createAdminProductSwagger,
  updateAdminProductSwagger,
  deleteAdminProductSwagger,
  getAdminCategoriesSwagger,
  createAdminCategorySwagger,
  updateAdminCategorySwagger,
  deleteAdminCategorySwagger,
  getAdminBrandsSwagger,
  createAdminBrandSwagger,
  updateAdminBrandSwagger,
  deleteAdminBrandSwagger,
  getAdminVariantsSwagger,
  createAdminVariantSwagger,
  updateAdminVariantSwagger,
  deleteAdminVariantSwagger,
  getAdminAttributesSwagger,
  createAdminAttributeSwagger,
  updateAdminAttributeSwagger,
  deleteAdminAttributeSwagger,
  getAdminReviewsSwagger,
  updateAdminReviewSwagger,
  deleteAdminReviewSwagger,
  getProductSeoSwagger,
  updateProductSeoSwagger,
} from "./admin-catalog.swagger"
import { authMiddleware } from "../../shared/middlewares/auth.middleware"
import { requireRoles } from "../../shared/middlewares/role.middleware"

export async function adminCatalogRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware)
  const adminGuard = [requireRoles("ADMIN", "SUPER_ADMIN")]

  // Products
  fastify.get("/api/v1/admin/products", { schema: getAdminProductsSwagger.schema, preHandler: adminGuard }, adminCatalogController.handleGetProducts as any)
  fastify.get("/api/v1/admin/products/:id", { schema: getAdminProductByIdSwagger.schema, preHandler: adminGuard }, adminCatalogController.handleGetProductById as any)
  fastify.post("/api/v1/admin/products", { schema: createAdminProductSwagger.schema, preHandler: adminGuard }, adminCatalogController.handleCreateProduct as any)
  fastify.patch("/api/v1/admin/products/:id", { schema: updateAdminProductSwagger.schema, preHandler: adminGuard }, adminCatalogController.handleUpdateProduct as any)
  fastify.delete("/api/v1/admin/products/:id", { schema: deleteAdminProductSwagger.schema, preHandler: adminGuard }, adminCatalogController.handleDeleteProduct as any)

  // Categories
  fastify.get("/api/v1/admin/categories", { schema: getAdminCategoriesSwagger.schema, preHandler: adminGuard }, adminCatalogController.handleGetCategories as any)
  fastify.post("/api/v1/admin/categories", { schema: createAdminCategorySwagger.schema, preHandler: adminGuard }, adminCatalogController.handleCreateCategory as any)
  fastify.patch("/api/v1/admin/categories/:id", { schema: updateAdminCategorySwagger.schema, preHandler: adminGuard }, adminCatalogController.handleUpdateCategory as any)
  fastify.delete("/api/v1/admin/categories/:id", { schema: deleteAdminCategorySwagger.schema, preHandler: adminGuard }, adminCatalogController.handleDeleteCategory as any)

  // Brands
  fastify.get("/api/v1/admin/brands", { schema: getAdminBrandsSwagger.schema, preHandler: adminGuard }, adminCatalogController.handleGetBrands as any)
  fastify.post("/api/v1/admin/brands", { schema: createAdminBrandSwagger.schema, preHandler: adminGuard }, adminCatalogController.handleCreateBrand as any)
  fastify.patch("/api/v1/admin/brands/:id", { schema: updateAdminBrandSwagger.schema, preHandler: adminGuard }, adminCatalogController.handleUpdateBrand as any)
  fastify.delete("/api/v1/admin/brands/:id", { schema: deleteAdminBrandSwagger.schema, preHandler: adminGuard }, adminCatalogController.handleDeleteBrand as any)

  // Variants
  fastify.get("/api/v1/admin/variants", { schema: getAdminVariantsSwagger.schema, preHandler: adminGuard }, adminCatalogController.handleGetVariants as any)
  fastify.post("/api/v1/admin/variants", { schema: createAdminVariantSwagger.schema, preHandler: adminGuard }, adminCatalogController.handleCreateVariant as any)
  fastify.patch("/api/v1/admin/variants/:id", { schema: updateAdminVariantSwagger.schema, preHandler: adminGuard }, adminCatalogController.handleUpdateVariant as any)
  fastify.delete("/api/v1/admin/variants/:id", { schema: deleteAdminVariantSwagger.schema, preHandler: adminGuard }, adminCatalogController.handleDeleteVariant as any)

  // Attributes
  fastify.get("/api/v1/admin/attributes", { schema: getAdminAttributesSwagger.schema, preHandler: adminGuard }, adminCatalogController.handleGetAttributes as any)
  fastify.post("/api/v1/admin/attributes", { schema: createAdminAttributeSwagger.schema, preHandler: adminGuard }, adminCatalogController.handleCreateAttribute as any)
  fastify.patch("/api/v1/admin/attributes/:id", { schema: updateAdminAttributeSwagger.schema, preHandler: adminGuard }, adminCatalogController.handleUpdateAttribute as any)
  fastify.delete("/api/v1/admin/attributes/:id", { schema: deleteAdminAttributeSwagger.schema, preHandler: adminGuard }, adminCatalogController.handleDeleteAttribute as any)

  // Reviews
  fastify.get("/api/v1/admin/reviews", { schema: getAdminReviewsSwagger.schema, preHandler: adminGuard }, adminCatalogController.handleGetReviews as any)
  fastify.patch("/api/v1/admin/reviews/:id", { schema: updateAdminReviewSwagger.schema, preHandler: adminGuard }, adminCatalogController.handleUpdateReview as any)
  fastify.delete("/api/v1/admin/reviews/:id", { schema: deleteAdminReviewSwagger.schema, preHandler: adminGuard }, adminCatalogController.handleDeleteReview as any)

  // SEO
  fastify.get("/api/v1/admin/products/:id/seo", { schema: getProductSeoSwagger.schema, preHandler: adminGuard }, adminCatalogController.handleGetProductSeo as any)
  fastify.patch("/api/v1/admin/products/:id/seo", { schema: updateProductSeoSwagger.schema, preHandler: adminGuard }, adminCatalogController.handleUpdateProductSeo as any)
}

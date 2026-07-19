import { FastifyRequest, FastifyReply } from "fastify"
import { adminCatalogService } from "./admin-catalog.service"
import { createSuccessResponse } from "../../shared/responses"
import {
  CatalogQueryInput,
  CreateAdminProductInput,
  UpdateAdminProductInput,
  CreateAdminCategoryInput,
  UpdateAdminCategoryInput,
  CreateAdminBrandInput,
  UpdateAdminBrandInput,
  CreateAdminVariantInput,
  UpdateAdminVariantInput,
  CreateAdminAttributeInput,
  UpdateAdminAttributeInput,
  UpdateAdminReviewInput,
  UpdateProductSeoInput,
} from "./admin-catalog.schema"

export class AdminCatalogController {
  // Products
  async handleGetProducts(request: FastifyRequest<{ Querystring: CatalogQueryInput }>, reply: FastifyReply) {
    const data = await adminCatalogService.getProducts(request.query)
    return reply.status(200).send(createSuccessResponse("Products retrieved successfully", data))
  }

  async handleGetProductById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const product = await adminCatalogService.getProductById(request.params.id)
    return reply.status(200).send(createSuccessResponse("Product detail retrieved successfully", product))
  }

  async handleCreateProduct(request: FastifyRequest<{ Body: CreateAdminProductInput }>, reply: FastifyReply) {
    const product = await adminCatalogService.createProduct(request.body)
    return reply.status(201).send(createSuccessResponse("Product created successfully", product))
  }

  async handleUpdateProduct(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateAdminProductInput }>,
    reply: FastifyReply
  ) {
    const product = await adminCatalogService.updateProduct(request.params.id, request.body)
    return reply.status(200).send(createSuccessResponse("Product updated successfully", product))
  }

  async handleDeleteProduct(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const product = await adminCatalogService.softDeleteProduct(request.params.id)
    return reply.status(200).send(createSuccessResponse("Product soft deleted successfully", product))
  }

  // Categories
  async handleGetCategories(request: FastifyRequest<{ Querystring: CatalogQueryInput }>, reply: FastifyReply) {
    const data = await adminCatalogService.getCategories(request.query)
    return reply.status(200).send(createSuccessResponse("Categories retrieved successfully", data))
  }

  async handleCreateCategory(request: FastifyRequest<{ Body: CreateAdminCategoryInput }>, reply: FastifyReply) {
    const category = await adminCatalogService.createCategory(request.body)
    return reply.status(201).send(createSuccessResponse("Category created successfully", category))
  }

  async handleUpdateCategory(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateAdminCategoryInput }>,
    reply: FastifyReply
  ) {
    const category = await adminCatalogService.updateCategory(request.params.id, request.body)
    return reply.status(200).send(createSuccessResponse("Category updated successfully", category))
  }

  async handleDeleteCategory(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const category = await adminCatalogService.softDeleteCategory(request.params.id)
    return reply.status(200).send(createSuccessResponse("Category soft deleted successfully", category))
  }

  // Brands
  async handleGetBrands(request: FastifyRequest<{ Querystring: CatalogQueryInput }>, reply: FastifyReply) {
    const data = await adminCatalogService.getBrands(request.query)
    return reply.status(200).send(createSuccessResponse("Brands retrieved successfully", data))
  }

  async handleCreateBrand(request: FastifyRequest<{ Body: CreateAdminBrandInput }>, reply: FastifyReply) {
    const brand = await adminCatalogService.createBrand(request.body)
    return reply.status(201).send(createSuccessResponse("Brand created successfully", brand))
  }

  async handleUpdateBrand(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateAdminBrandInput }>,
    reply: FastifyReply
  ) {
    const brand = await adminCatalogService.updateBrand(request.params.id, request.body)
    return reply.status(200).send(createSuccessResponse("Brand updated successfully", brand))
  }

  async handleDeleteBrand(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const brand = await adminCatalogService.softDeleteBrand(request.params.id)
    return reply.status(200).send(createSuccessResponse("Brand soft deleted successfully", brand))
  }

  // Variants
  async handleGetVariants(request: FastifyRequest<{ Querystring: CatalogQueryInput }>, reply: FastifyReply) {
    const data = await adminCatalogService.getVariants(request.query)
    return reply.status(200).send(createSuccessResponse("Variants retrieved successfully", data))
  }

  async handleCreateVariant(request: FastifyRequest<{ Body: CreateAdminVariantInput }>, reply: FastifyReply) {
    const variant = await adminCatalogService.createVariant(request.body)
    return reply.status(201).send(createSuccessResponse("Variant created successfully", variant))
  }

  async handleUpdateVariant(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateAdminVariantInput }>,
    reply: FastifyReply
  ) {
    const variant = await adminCatalogService.updateVariant(request.params.id, request.body)
    return reply.status(200).send(createSuccessResponse("Variant updated successfully", variant))
  }

  async handleDeleteVariant(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const variant = await adminCatalogService.softDeleteVariant(request.params.id)
    return reply.status(200).send(createSuccessResponse("Variant soft deleted successfully", variant))
  }

  // Attributes
  async handleGetAttributes(_request: FastifyRequest, reply: FastifyReply) {
    const data = await adminCatalogService.getAttributes()
    return reply.status(200).send(createSuccessResponse("Attributes retrieved successfully", data))
  }

  async handleCreateAttribute(request: FastifyRequest<{ Body: CreateAdminAttributeInput }>, reply: FastifyReply) {
    const attribute = await adminCatalogService.createAttribute(request.body)
    return reply.status(201).send(createSuccessResponse("Attribute created successfully", attribute))
  }

  async handleUpdateAttribute(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateAdminAttributeInput }>,
    reply: FastifyReply
  ) {
    const attribute = await adminCatalogService.updateAttribute(request.params.id, request.body)
    return reply.status(200).send(createSuccessResponse("Attribute updated successfully", attribute))
  }

  async handleDeleteAttribute(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const attribute = await adminCatalogService.softDeleteAttribute(request.params.id)
    return reply.status(200).send(createSuccessResponse("Attribute soft deleted successfully", attribute))
  }

  // Reviews
  async handleGetReviews(request: FastifyRequest<{ Querystring: CatalogQueryInput }>, reply: FastifyReply) {
    const data = await adminCatalogService.getReviews(request.query)
    return reply.status(200).send(createSuccessResponse("Reviews retrieved successfully", data))
  }

  async handleUpdateReview(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateAdminReviewInput }>,
    reply: FastifyReply
  ) {
    const review = await adminCatalogService.updateReview(request.params.id, request.body)
    return reply.status(200).send(createSuccessResponse("Review updated successfully", review))
  }

  async handleDeleteReview(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const review = await adminCatalogService.softDeleteReview(request.params.id)
    return reply.status(200).send(createSuccessResponse("Review deleted successfully", review))
  }

  // SEO
  async handleGetProductSeo(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const seo = await adminCatalogService.getProductSeo(request.params.id)
    return reply.status(200).send(createSuccessResponse("Product SEO retrieved successfully", seo))
  }

  async handleUpdateProductSeo(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateProductSeoInput }>,
    reply: FastifyReply
  ) {
    const seo = await adminCatalogService.updateProductSeo(request.params.id, request.body)
    return reply.status(200).send(createSuccessResponse("Product SEO updated successfully", seo))
  }
}

export const adminCatalogController = new AdminCatalogController()

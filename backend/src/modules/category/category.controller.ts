import { FastifyRequest, FastifyReply } from "fastify";
import { categoryService } from "./category.service";
import { productService } from "../product/product.service";
import { CreateCategoryInput, UpdateCategoryInput, CategorySearchQuery } from "./category.schema";
import { createSuccessResponse } from "../../shared/responses";

export class CategoryController {
  async handleCreateCategory(
    request: FastifyRequest<{ Body: CreateCategoryInput }>,
    reply: FastifyReply
  ) {
    const category = await categoryService.createCategory(request.body);
    return reply.status(201).send(
      createSuccessResponse("Category created successfully", category)
    );
  }

  async handleUpdateCategory(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateCategoryInput }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const category = await categoryService.updateCategory(id, request.body);
    return reply.status(200).send(
      createSuccessResponse("Category updated successfully", category)
    );
  }

  async handleDeleteCategory(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const category = await categoryService.softDeleteCategory(id);
    return reply.status(200).send(
      createSuccessResponse("Category deleted successfully", category)
    );
  }

  async handleGetCategories(
    request: FastifyRequest<{ Querystring: CategorySearchQuery }>,
    reply: FastifyReply
  ) {
    const { categories, meta } = await categoryService.getCategoryList(request.query);
    return reply.status(200).send(
      createSuccessResponse("Categories retrieved successfully", categories, meta)
    );
  }

  async handleGetCategoryDetail(
    request: FastifyRequest<{ Params: { slug: string }; Querystring: CategorySearchQuery }>,
    reply: FastifyReply
  ) {
    const { slug } = request.params;
    const { page, limit } = request.query;

    const category = await categoryService.getCategoryBySlug(slug);

    // Call product service to get paginated products in this category
    const { products, meta } = await productService.getProductsByCategorySlug(slug, {
      page,
      limit,
    });

    return reply.status(200).send(
      createSuccessResponse(
        "Category details with products retrieved successfully",
        {
          category,
          products,
        },
        meta
      )
    );
  }
}

export const categoryController = new CategoryController();

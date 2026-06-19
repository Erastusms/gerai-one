import { categoryRepository } from "./category.repository";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.schema";
import { ConflictException, NotFoundException } from "../../shared/exceptions";
import { getPaginationParams, createPaginationMeta } from "../../shared/utils/pagination";
import { Category } from "@prisma/client";

export class CategoryService {
  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const existing = await categoryRepository.findBySlug(input.slug, true);
    if (existing) {
      throw new ConflictException("Category with this slug already exists");
    }

    return categoryRepository.create({
      name: input.name,
      slug: input.slug,
      description: input.description,
      imageUrl: input.imageUrl,
      isActive: input.isActive,
    });
  }

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException("Category not found");
    }

    if (input.slug && input.slug !== category.slug) {
      const existing = await categoryRepository.findBySlug(input.slug, true);
      if (existing && existing.id !== id) {
        throw new ConflictException("Category with this slug already exists");
      }
    }

    return categoryRepository.update(id, {
      name: input.name,
      slug: input.slug,
      description: input.description,
      imageUrl: input.imageUrl,
      isActive: input.isActive,
    });
  }

  async softDeleteCategory(id: string): Promise<Category> {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return categoryRepository.softDelete(id);
  }

  async getCategoryList(options: { page?: number; limit?: number }) {
    const { page, limit, skip } = getPaginationParams(options);

    const [categories, totalItems] = await Promise.all([
      categoryRepository.findManyWithCount({ skip, limit, onlyActive: true }),
      categoryRepository.count({ onlyActive: true }),
    ]);

    const meta = createPaginationMeta(totalItems, page, limit);

    return {
      categories,
      meta,
    };
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const category = await categoryRepository.findBySlug(slug);
    if (!category || !category.isActive) {
      throw new NotFoundException("Category not found or is inactive");
    }
    return category;
  }
}

export const categoryService = new CategoryService();

import { brandRepository } from "./brand.repository";
import { CreateBrandInput, UpdateBrandInput } from "./brand.schema";
import { ConflictException, NotFoundException } from "../../shared/exceptions";
import { getPaginationParams, createPaginationMeta } from "../../shared/utils/pagination";
import { Brand } from "@prisma/client";

export class BrandService {
  async createBrand(input: CreateBrandInput): Promise<Brand> {
    const existing = await brandRepository.findBySlug(input.slug, true);
    if (existing) {
      throw new ConflictException("Brand with this slug already exists");
    }

    return brandRepository.create({
      name: input.name,
      slug: input.slug,
      logoUrl: input.logoUrl,
      isActive: input.isActive,
    });
  }

  async updateBrand(id: string, input: UpdateBrandInput): Promise<Brand> {
    const brand = await brandRepository.findById(id);
    if (!brand) {
      throw new NotFoundException("Brand not found");
    }

    if (input.slug && input.slug !== brand.slug) {
      const existing = await brandRepository.findBySlug(input.slug, true);
      if (existing && existing.id !== id) {
        throw new ConflictException("Brand with this slug already exists");
      }
    }

    return brandRepository.update(id, {
      name: input.name,
      slug: input.slug,
      logoUrl: input.logoUrl,
      isActive: input.isActive,
    });
  }

  async softDeleteBrand(id: string): Promise<Brand> {
    const brand = await brandRepository.findById(id);
    if (!brand) {
      throw new NotFoundException("Brand not found");
    }

    return brandRepository.softDelete(id);
  }

  async getBrandList(options: { page?: number; limit?: number }) {
    const { page, limit, skip } = getPaginationParams(options);

    const [brands, totalItems] = await Promise.all([
      brandRepository.findMany({ skip, limit, onlyActive: true }),
      brandRepository.count({ onlyActive: true }),
    ]);

    const meta = createPaginationMeta(totalItems, page, limit);

    return {
      brands,
      meta,
    };
  }

  async getBrandBySlug(slug: string, options: { page?: number; limit?: number }) {
    const brand = await brandRepository.findBySlug(slug);
    if (!brand || !brand.isActive) {
      throw new NotFoundException("Brand not found or is inactive");
    }

    const { page, limit, skip } = getPaginationParams(options);

    const [products, totalProducts] = await Promise.all([
      brandRepository.findProductsByBrandId(brand.id, { skip, limit }),
      brandRepository.countProductsByBrandId(brand.id),
    ]);

    const meta = createPaginationMeta(totalProducts, page, limit);

    return {
      brand,
      products,
      meta,
    };
  }
}

export const brandService = new BrandService();

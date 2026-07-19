import { prisma } from "../../shared/database"
import { NotFoundException, ConflictException } from "../../shared/exceptions"
import { Prisma } from "@prisma/client"
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

export class AdminCatalogService {
  // ── PRODUCTS ──
  async getProducts(query: CatalogQueryInput) {
    const page = Math.max(1, query.page ?? 1)
    const limit = Math.min(100, Math.max(1, query.limit ?? 20))
    const skip = (page - 1) * limit
    const { search, status, brandId, categoryId, sortBy, sortOrder } = query

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(status ? { isActive: status === "ACTIVE" } : {}),
      ...(brandId ? { brandId } : {}),
      ...(categoryId ? { categories: { some: { categoryId } } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    }

    const [rawProducts, totalItems] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy || "createdAt"]: sortOrder || "desc",
        },
        include: {
          brand: { select: { id: true, name: true } },
          categories: { include: { category: { select: { id: true, name: true } } } },
          variants: {
            where: { deletedAt: null },
            include: { inventory: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ])

    const products = rawProducts.map((p) => {
      let totalStock = 0
      p.variants.forEach((v) => {
        totalStock += v.inventory?.availableStock || 0
      })
      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        slug: p.slug,
        brand: p.brand ? p.brand.name : null,
        brandId: p.brandId,
        categoryCount: p.categories.length,
        categories: p.categories.map((c) => c.category),
        price: Number(p.price),
        discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
        stock: totalStock,
        thumbnailUrl: p.thumbnailUrl,
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }
    })

    return {
      products,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    }
  }

  async getProductById(id: string) {
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        brand: true,
        categories: { include: { category: true } },
        images: { orderBy: { sortOrder: "asc" } },
        specifications: true,
        variants: {
          where: { deletedAt: null },
          include: { inventory: true },
        },
        seo: true,
      },
    })
    if (!product) {
      throw new NotFoundException("Product not found")
    }
    return product
  }

  async createProduct(input: CreateAdminProductInput) {
    const existingSku = await prisma.product.findUnique({ where: { sku: input.sku } })
    if (existingSku) throw new ConflictException(`Product with SKU "${input.sku}" already exists`)

    const existingSlug = await prisma.product.findUnique({ where: { slug: input.slug } })
    if (existingSlug) throw new ConflictException(`Product with slug "${input.slug}" already exists`)

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          sku: input.sku,
          name: input.name,
          slug: input.slug,
          shortDescription: input.shortDescription,
          description: input.description,
          brandId: input.brandId,
          price: input.price,
          discountPrice: input.discountPrice,
          weight: input.weight,
          thumbnailUrl: input.thumbnailUrl,
          isActive: input.isActive,
          isFeatured: input.isFeatured,
        },
      })

      // Categories mapping
      if (input.categoryIds && input.categoryIds.length > 0) {
        await tx.productCategory.createMany({
          data: input.categoryIds.map((catId) => ({
            productId: product.id,
            categoryId: catId,
          })),
        })
      }

      // Media Images
      if (input.imageUrls && input.imageUrls.length > 0) {
        await tx.productImage.createMany({
          data: input.imageUrls.map((url, idx) => ({
            productId: product.id,
            imageUrl: url,
            sortOrder: idx,
          })),
        })
      }

      // Default Product Variant & Inventory
      const variant = await tx.productVariant.create({
        data: {
          productId: product.id,
          sku: `${input.sku}-DEFAULT`,
          price: input.price,
          weight: input.weight,
          isActive: true,
        },
      })

      await tx.inventory.create({
        data: {
          productVariantId: variant.id,
          availableStock: input.stock || 0,
          safetyStock: 10,
        },
      })

      // SEO
      if (input.seoTitle || input.seoDescription || input.seoKeywords) {
        await tx.productSeo.create({
          data: {
            productId: product.id,
            seoTitle: input.seoTitle,
            seoDescription: input.seoDescription,
            seoKeywords: input.seoKeywords,
          },
        })
      }

      return product
    })
  }

  async updateProduct(id: string, input: UpdateAdminProductInput) {
    const product = await prisma.product.findFirst({ where: { id, deletedAt: null } })
    if (!product) throw new NotFoundException("Product not found")

    return prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: {
          name: input.name !== undefined ? input.name : product.name,
          slug: input.slug !== undefined ? input.slug : product.slug,
          sku: input.sku !== undefined ? input.sku : product.sku,
          shortDescription: input.shortDescription !== undefined ? input.shortDescription : product.shortDescription,
          description: input.description !== undefined ? input.description : product.description,
          brandId: input.brandId !== undefined ? input.brandId : product.brandId,
          price: input.price !== undefined ? input.price : product.price,
          discountPrice: input.discountPrice !== undefined ? input.discountPrice : product.discountPrice,
          weight: input.weight !== undefined ? input.weight : product.weight,
          thumbnailUrl: input.thumbnailUrl !== undefined ? input.thumbnailUrl : product.thumbnailUrl,
          isActive: input.isActive !== undefined ? input.isActive : product.isActive,
          isFeatured: input.isFeatured !== undefined ? input.isFeatured : product.isFeatured,
        },
      })

      if (input.categoryIds !== undefined) {
        await tx.productCategory.deleteMany({ where: { productId: id } })
        if (input.categoryIds.length > 0) {
          await tx.productCategory.createMany({
            data: input.categoryIds.map((catId) => ({
              productId: id,
              categoryId: catId,
            })),
          })
        }
      }

      if (input.stock !== undefined) {
        const defaultVariant = await tx.productVariant.findFirst({
          where: { productId: id, deletedAt: null },
        })
        if (defaultVariant) {
          await tx.inventory.upsert({
            where: { productVariantId: defaultVariant.id },
            update: { availableStock: input.stock },
            create: { productVariantId: defaultVariant.id, availableStock: input.stock, safetyStock: 10 },
          })
        }
      }

      return updated
    })
  }

  async softDeleteProduct(id: string) {
    const product = await prisma.product.findFirst({ where: { id, deletedAt: null } })
    if (!product) throw new NotFoundException("Product not found")

    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  // ── CATEGORIES ──
  async getCategories(query: CatalogQueryInput) {
    const page = Math.max(1, query.page ?? 1)
    const limit = Math.min(100, Math.max(1, query.limit ?? 20))
    const skip = (page - 1) * limit
    const { search, status, sortBy, sortOrder } = query

    const where: Prisma.CategoryWhereInput = {
      deletedAt: null,
      ...(status ? { isActive: status === "ACTIVE" } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    }

    const [categories, totalItems] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy || "createdAt"]: sortOrder || "desc" },
        include: { _count: { select: { products: true } } },
      }),
      prisma.category.count({ where }),
    ])

    return {
      categories: categories.map((c) => ({
        ...c,
        productCount: c._count.products,
      })),
      meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    }
  }

  async createCategory(input: CreateAdminCategoryInput) {
    const existing = await prisma.category.findUnique({ where: { slug: input.slug } })
    if (existing) throw new ConflictException(`Category with slug "${input.slug}" already exists`)

    return prisma.category.create({ data: input })
  }

  async updateCategory(id: string, input: UpdateAdminCategoryInput) {
    const category = await prisma.category.findFirst({ where: { id, deletedAt: null } })
    if (!category) throw new NotFoundException("Category not found")

    return prisma.category.update({ where: { id }, data: input })
  }

  async softDeleteCategory(id: string) {
    const category = await prisma.category.findFirst({ where: { id, deletedAt: null } })
    if (!category) throw new NotFoundException("Category not found")

    return prisma.category.update({ where: { id }, data: { deletedAt: new Date() } })
  }

  // ── BRANDS ──
  async getBrands(query: CatalogQueryInput) {
    const page = Math.max(1, query.page ?? 1)
    const limit = Math.min(100, Math.max(1, query.limit ?? 20))
    const skip = (page - 1) * limit
    const { search, status, sortBy, sortOrder } = query

    const where: Prisma.BrandWhereInput = {
      deletedAt: null,
      ...(status ? { isActive: status === "ACTIVE" } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    }

    const [brands, totalItems] = await Promise.all([
      prisma.brand.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy || "createdAt"]: sortOrder || "desc" },
        include: { _count: { select: { products: true } } },
      }),
      prisma.brand.count({ where }),
    ])

    return {
      brands: brands.map((b) => ({
        ...b,
        productCount: b._count.products,
      })),
      meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    }
  }

  async createBrand(input: CreateAdminBrandInput) {
    const existing = await prisma.brand.findUnique({ where: { slug: input.slug } })
    if (existing) throw new ConflictException(`Brand with slug "${input.slug}" already exists`)

    return prisma.brand.create({ data: input })
  }

  async updateBrand(id: string, input: UpdateAdminBrandInput) {
    const brand = await prisma.brand.findFirst({ where: { id, deletedAt: null } })
    if (!brand) throw new NotFoundException("Brand not found")

    return prisma.brand.update({ where: { id }, data: input })
  }

  async softDeleteBrand(id: string) {
    const brand = await prisma.brand.findFirst({ where: { id, deletedAt: null } })
    if (!brand) throw new NotFoundException("Brand not found")

    return prisma.brand.update({ where: { id }, data: { deletedAt: new Date() } })
  }

  // ── VARIANTS ──
  async getVariants(query: CatalogQueryInput) {
    const page = Math.max(1, query.page ?? 1)
    const limit = Math.min(100, Math.max(1, query.limit ?? 20))
    const skip = (page - 1) * limit
    const { search, status, sortBy, sortOrder } = query

    const where: Prisma.ProductVariantWhereInput = {
      deletedAt: null,
      ...(status ? { isActive: status === "ACTIVE" } : {}),
      ...(search ? { sku: { contains: search, mode: "insensitive" } } : {}),
    }

    const [variants, totalItems] = await Promise.all([
      prisma.productVariant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy || "createdAt"]: sortOrder || "desc" },
        include: { product: { select: { name: true } }, inventory: true },
      }),
      prisma.productVariant.count({ where }),
    ])

    return {
      variants: variants.map((v) => ({
        id: v.id,
        productId: v.productId,
        productName: v.product.name,
        sku: v.sku,
        price: Number(v.price),
        weight: v.weight,
        stock: v.inventory?.availableStock || 0,
        isActive: v.isActive,
        createdAt: v.createdAt,
      })),
      meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    }
  }

  async createVariant(input: CreateAdminVariantInput) {
    const existing = await prisma.productVariant.findUnique({ where: { sku: input.sku } })
    if (existing) throw new ConflictException(`Variant with SKU "${input.sku}" already exists`)

    return prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.create({
        data: {
          productId: input.productId,
          sku: input.sku,
          price: input.price,
          weight: input.weight,
          isActive: input.isActive,
        },
      })
      await tx.inventory.create({
        data: {
          productVariantId: variant.id,
          availableStock: input.stock || 0,
        },
      })
      return variant
    })
  }

  async updateVariant(id: string, input: UpdateAdminVariantInput) {
    const variant = await prisma.productVariant.findFirst({ where: { id, deletedAt: null } })
    if (!variant) throw new NotFoundException("Variant not found")

    return prisma.$transaction(async (tx) => {
      const updated = await tx.productVariant.update({
        where: { id },
        data: {
          sku: input.sku !== undefined ? input.sku : variant.sku,
          price: input.price !== undefined ? input.price : variant.price,
          weight: input.weight !== undefined ? input.weight : variant.weight,
          isActive: input.isActive !== undefined ? input.isActive : variant.isActive,
        },
      })

      if (input.stock !== undefined) {
        await tx.inventory.upsert({
          where: { productVariantId: id },
          update: { availableStock: input.stock },
          create: { productVariantId: id, availableStock: input.stock },
        })
      }
      return updated
    })
  }

  async softDeleteVariant(id: string) {
    const variant = await prisma.productVariant.findFirst({ where: { id, deletedAt: null } })
    if (!variant) throw new NotFoundException("Variant not found")

    return prisma.productVariant.update({ where: { id }, data: { deletedAt: new Date() } })
  }

  // ── ATTRIBUTES ──
  async getAttributes() {
    const attributes = await prisma.attribute.findMany({
      where: { deletedAt: null },
      include: { values: { where: { deletedAt: null } } },
      orderBy: { createdAt: "desc" },
    })
    return attributes
  }

  async createAttribute(input: CreateAdminAttributeInput) {
    return prisma.$transaction(async (tx) => {
      const attribute = await tx.attribute.create({
        data: { name: input.name },
      })
      if (input.values && input.values.length > 0) {
        await tx.attributeValue.createMany({
          data: input.values.map((v) => ({
            attributeId: attribute.id,
            value: v,
          })),
        })
      }
      return attribute
    })
  }

  async updateAttribute(id: string, input: UpdateAdminAttributeInput) {
    const attribute = await prisma.attribute.findFirst({ where: { id, deletedAt: null } })
    if (!attribute) throw new NotFoundException("Attribute not found")

    return prisma.$transaction(async (tx) => {
      const updated = await tx.attribute.update({
        where: { id },
        data: { name: input.name !== undefined ? input.name : attribute.name },
      })
      if (input.values !== undefined) {
        await tx.attributeValue.deleteMany({ where: { attributeId: id } })
        if (input.values.length > 0) {
          await tx.attributeValue.createMany({
            data: input.values.map((v) => ({ attributeId: id, value: v })),
          })
        }
      }
      return updated
    })
  }

  async softDeleteAttribute(id: string) {
    const attribute = await prisma.attribute.findFirst({ where: { id, deletedAt: null } })
    if (!attribute) throw new NotFoundException("Attribute not found")

    return prisma.attribute.update({ where: { id }, data: { deletedAt: new Date() } })
  }

  // ── REVIEWS ──
  async getReviews(query: CatalogQueryInput) {
    const page = Math.max(1, query.page ?? 1)
    const limit = Math.min(100, Math.max(1, query.limit ?? 20))
    const skip = (page - 1) * limit

    const where: Prisma.ReviewWhereInput = {
      deletedAt: null,
    }

    const [reviews, totalItems] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { id: true, name: true, thumbnailUrl: true } },
          user: { select: { id: true, fullName: true, email: true, profilePhoto: true } },
        },
      }),
      prisma.review.count({ where }),
    ])

    return {
      reviews,
      meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    }
  }

  async updateReview(id: string, input: UpdateAdminReviewInput) {
    const review = await prisma.review.findFirst({ where: { id, deletedAt: null } })
    if (!review) throw new NotFoundException("Review not found")

    return prisma.review.update({
      where: { id },
      data: { isHidden: input.isHidden !== undefined ? input.isHidden : review.isHidden },
    })
  }

  async softDeleteReview(id: string) {
    const review = await prisma.review.findFirst({ where: { id, deletedAt: null } })
    if (!review) throw new NotFoundException("Review not found")

    return prisma.review.update({ where: { id }, data: { deletedAt: new Date() } })
  }

  // ── SEO ──
  async getProductSeo(productId: string) {
    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      include: { seo: true },
    })
    if (!product) throw new NotFoundException("Product not found")

    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      seoTitle: product.seo?.seoTitle || product.name,
      seoDescription: product.seo?.seoDescription || product.shortDescription || "",
      seoKeywords: product.seo?.seoKeywords || "",
    }
  }

  async updateProductSeo(productId: string, input: UpdateProductSeoInput) {
    const product = await prisma.product.findFirst({ where: { id: productId, deletedAt: null } })
    if (!product) throw new NotFoundException("Product not found")

    return prisma.$transaction(async (tx) => {
      if (input.slug && input.slug !== product.slug) {
        await tx.product.update({ where: { id: productId }, data: { slug: input.slug } })
      }
      const seo = await tx.productSeo.upsert({
        where: { productId },
        update: {
          seoTitle: input.seoTitle,
          seoDescription: input.seoDescription,
          seoKeywords: input.seoKeywords,
        },
        create: {
          productId,
          seoTitle: input.seoTitle,
          seoDescription: input.seoDescription,
          seoKeywords: input.seoKeywords,
        },
      })
      return seo
    })
  }
}

export const adminCatalogService = new AdminCatalogService()

import { apiSuccessResponseSchema } from "../auth/auth.schema"
import {
  catalogQuerySchema,
  createAdminProductSchema,
  updateAdminProductSchema,
  createAdminCategorySchema,
  updateAdminCategorySchema,
  createAdminBrandSchema,
  updateAdminBrandSchema,
  createAdminVariantSchema,
  updateAdminVariantSchema,
  createAdminAttributeSchema,
  updateAdminAttributeSchema,
  updateAdminReviewSchema,
  updateProductSeoSchema,
} from "./admin-catalog.schema"
import { z } from "zod"

export const getAdminProductsSwagger = {
  schema: {
    description: "Retrieve paginated list of products (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Get products",
    security: [{ BearerAuth: [] }],
    querystring: catalogQuerySchema,
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Products retrieved successfully"),
    },
  },
}

export const getAdminProductByIdSwagger = {
  schema: {
    description: "Retrieve product detail by ID (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Get product detail",
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Product retrieved successfully"),
    },
  },
}

export const createAdminProductSwagger = {
  schema: {
    description: "Create a new product with categories, images, and SEO (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Create product",
    security: [{ BearerAuth: [] }],
    body: createAdminProductSchema,
    response: {
      201: apiSuccessResponseSchema(z.any()).describe("Product created successfully"),
    },
  },
}

export const updateAdminProductSwagger = {
  schema: {
    description: "Update existing product details (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Update product",
    security: [{ BearerAuth: [] }],
    body: updateAdminProductSchema,
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Product updated successfully"),
    },
  },
}

export const deleteAdminProductSwagger = {
  schema: {
    description: "Soft delete product (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Delete product",
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Product soft deleted"),
    },
  },
}

// Categories
export const getAdminCategoriesSwagger = {
  schema: {
    description: "Retrieve list of categories (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Get categories",
    security: [{ BearerAuth: [] }],
    querystring: catalogQuerySchema,
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Categories retrieved"),
    },
  },
}

export const createAdminCategorySwagger = {
  schema: {
    description: "Create category (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Create category",
    security: [{ BearerAuth: [] }],
    body: createAdminCategorySchema,
    response: {
      201: apiSuccessResponseSchema(z.any()).describe("Category created"),
    },
  },
}

export const updateAdminCategorySwagger = {
  schema: {
    description: "Update category (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Update category",
    security: [{ BearerAuth: [] }],
    body: updateAdminCategorySchema,
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Category updated"),
    },
  },
}

export const deleteAdminCategorySwagger = {
  schema: {
    description: "Soft delete category (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Delete category",
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Category soft deleted"),
    },
  },
}

// Brands
export const getAdminBrandsSwagger = {
  schema: {
    description: "Retrieve list of brands (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Get brands",
    security: [{ BearerAuth: [] }],
    querystring: catalogQuerySchema,
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Brands retrieved"),
    },
  },
}

export const createAdminBrandSwagger = {
  schema: {
    description: "Create brand (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Create brand",
    security: [{ BearerAuth: [] }],
    body: createAdminBrandSchema,
    response: {
      201: apiSuccessResponseSchema(z.any()).describe("Brand created"),
    },
  },
}

export const updateAdminBrandSwagger = {
  schema: {
    description: "Update brand (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Update brand",
    security: [{ BearerAuth: [] }],
    body: updateAdminBrandSchema,
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Brand updated"),
    },
  },
}

export const deleteAdminBrandSwagger = {
  schema: {
    description: "Soft delete brand (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Delete brand",
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Brand soft deleted"),
    },
  },
}

// Variants
export const getAdminVariantsSwagger = {
  schema: {
    description: "Retrieve list of product variants (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Get variants",
    security: [{ BearerAuth: [] }],
    querystring: catalogQuerySchema,
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Variants retrieved"),
    },
  },
}

export const createAdminVariantSwagger = {
  schema: {
    description: "Create product variant (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Create variant",
    security: [{ BearerAuth: [] }],
    body: createAdminVariantSchema,
    response: {
      201: apiSuccessResponseSchema(z.any()).describe("Variant created"),
    },
  },
}

export const updateAdminVariantSwagger = {
  schema: {
    description: "Update variant (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Update variant",
    security: [{ BearerAuth: [] }],
    body: updateAdminVariantSchema,
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Variant updated"),
    },
  },
}

export const deleteAdminVariantSwagger = {
  schema: {
    description: "Soft delete variant (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Delete variant",
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Variant soft deleted"),
    },
  },
}

// Attributes
export const getAdminAttributesSwagger = {
  schema: {
    description: "Retrieve product attributes (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Get attributes",
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Attributes retrieved"),
    },
  },
}

export const createAdminAttributeSwagger = {
  schema: {
    description: "Create attribute (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Create attribute",
    security: [{ BearerAuth: [] }],
    body: createAdminAttributeSchema,
    response: {
      201: apiSuccessResponseSchema(z.any()).describe("Attribute created"),
    },
  },
}

export const updateAdminAttributeSwagger = {
  schema: {
    description: "Update attribute (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Update attribute",
    security: [{ BearerAuth: [] }],
    body: updateAdminAttributeSchema,
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Attribute updated"),
    },
  },
}

export const deleteAdminAttributeSwagger = {
  schema: {
    description: "Soft delete attribute (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Delete attribute",
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Attribute soft deleted"),
    },
  },
}

// Reviews
export const getAdminReviewsSwagger = {
  schema: {
    description: "Retrieve customer reviews for moderation (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Get reviews",
    security: [{ BearerAuth: [] }],
    querystring: catalogQuerySchema,
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Reviews retrieved"),
    },
  },
}

export const updateAdminReviewSwagger = {
  schema: {
    description: "Moderate review visibility (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Update review",
    security: [{ BearerAuth: [] }],
    body: updateAdminReviewSchema,
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Review updated"),
    },
  },
}

export const deleteAdminReviewSwagger = {
  schema: {
    description: "Soft delete review (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Delete review",
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Review deleted"),
    },
  },
}

// SEO
export const getProductSeoSwagger = {
  schema: {
    description: "Retrieve product SEO configuration (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Get product SEO",
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Product SEO retrieved"),
    },
  },
}

export const updateProductSeoSwagger = {
  schema: {
    description: "Update product SEO metadata and slug (Admin only)",
    tags: ["Admin Catalog Management"],
    summary: "Update product SEO",
    security: [{ BearerAuth: [] }],
    body: updateProductSeoSchema,
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Product SEO updated"),
    },
  },
}

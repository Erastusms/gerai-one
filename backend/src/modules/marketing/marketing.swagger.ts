import { z } from "zod"
import { apiSuccessResponseSchema } from "../auth/auth.schema"
import {
  createBannerSchema,
  updateBannerSchema,
  bannerQuerySchema,
  createVoucherSchema,
  updateVoucherSchema,
  voucherQuerySchema,
  updateMarketingConfigSchema,
} from "./marketing.schema"

export const getAdminBannersSwagger = {
  schema: {
    description: "Get paginated banner list for admin management",
    tags: ["Admin Marketing"],
    summary: "Get admin banners",
    security: [{ BearerAuth: [] }],
    querystring: bannerQuerySchema,
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Admin banners fetched successfully"),
    },
  },
}

export const createBannerSwagger = {
  schema: {
    description: "Create a new promotional hero banner",
    tags: ["Admin Marketing"],
    summary: "Create banner",
    security: [{ BearerAuth: [] }],
    body: createBannerSchema,
    response: {
      201: apiSuccessResponseSchema(z.any()).describe("Banner created successfully"),
    },
  },
}

export const updateBannerSwagger = {
  schema: {
    description: "Update existing banner details",
    tags: ["Admin Marketing"],
    summary: "Update banner",
    security: [{ BearerAuth: [] }],
    body: updateBannerSchema,
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Banner updated successfully"),
    },
  },
}

export const getCustomerBannersSwagger = {
  schema: {
    description: "Get active enabled banners for customer storefront carousel",
    tags: ["Customer Marketing"],
    summary: "Get customer banners",
    response: {
      200: apiSuccessResponseSchema(z.array(z.any())).describe("Customer banners fetched successfully"),
    },
  },
}

export const getAdminVouchersSwagger = {
  schema: {
    description: "Get paginated voucher list for admin management",
    tags: ["Admin Marketing"],
    summary: "Get admin vouchers",
    security: [{ BearerAuth: [] }],
    querystring: voucherQuerySchema,
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Admin vouchers fetched successfully"),
    },
  },
}

export const createVoucherSwagger = {
  schema: {
    description: "Create a new promotional discount voucher",
    tags: ["Admin Marketing"],
    summary: "Create voucher",
    security: [{ BearerAuth: [] }],
    body: createVoucherSchema,
    response: {
      201: apiSuccessResponseSchema(z.any()).describe("Voucher created successfully"),
    },
  },
}

export const updateVoucherSwagger = {
  schema: {
    description: "Update existing voucher details",
    tags: ["Admin Marketing"],
    summary: "Update voucher",
    security: [{ BearerAuth: [] }],
    body: updateVoucherSchema,
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Voucher updated successfully"),
    },
  },
}

export const getCustomerVouchersSwagger = {
  schema: {
    description: "Get active enabled vouchers for customer storefront checkout",
    tags: ["Customer Marketing"],
    summary: "Get customer vouchers",
    response: {
      200: apiSuccessResponseSchema(z.array(z.any())).describe("Customer vouchers fetched successfully"),
    },
  },
}

export const getMarketingConfigSwagger = {
  schema: {
    description: "Get marketing configuration rules",
    tags: ["Marketing Config"],
    summary: "Get marketing config",
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Marketing configuration fetched successfully"),
    },
  },
}

export const updateMarketingConfigSwagger = {
  schema: {
    description: "Update global marketing configuration rules",
    tags: ["Marketing Config"],
    summary: "Update marketing config",
    security: [{ BearerAuth: [] }],
    body: updateMarketingConfigSchema,
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Marketing configuration updated successfully"),
    },
  },
}

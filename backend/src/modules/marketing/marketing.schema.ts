import { z } from "zod"

export const createBannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  desktopImageUrl: z.string().url("Valid desktop image URL is required"),
  mobileImageUrl: z.string().url().optional().nullable(),
  redirectUrl: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
  startDate: z.string().datetime({ message: "Valid start date ISO timestamp is required" }),
  endDate: z.string().datetime({ message: "Valid end date ISO timestamp is required" }),
  isActive: z.boolean().default(true),
  isEnabled: z.boolean().default(true),
})

export const updateBannerSchema = createBannerSchema.partial()

export const bannerQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  isEnabled: z.coerce.boolean().optional(),
})

export const createVoucherSchema = z.object({
  code: z.string().min(1, "Voucher code is required").transform((val) => val.toUpperCase().trim()),
  name: z.string().min(1, "Voucher name is required"),
  description: z.string().optional().nullable(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z.number().positive("Discount value must be greater than 0"),
  maxDiscountAmount: z.number().positive().optional().nullable(),
  minPurchaseAmount: z.number().nonnegative().default(0),
  usageLimit: z.number().int().positive().optional().nullable(),
  usagePerUser: z.number().int().positive().default(1),
  startDate: z.string().datetime({ message: "Valid start date ISO timestamp is required" }),
  endDate: z.string().datetime({ message: "Valid end date ISO timestamp is required" }),
  isActive: z.boolean().default(true),
  isEnabled: z.boolean().default(true),
})

export const updateVoucherSchema = createVoucherSchema.partial()

export const voucherQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
})

export const updateMarketingConfigSchema = z.object({
  allowMultipleVouchers: z.boolean(),
})

export type CreateBannerInput = z.infer<typeof createBannerSchema>
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>
export type BannerQueryInput = z.infer<typeof bannerQuerySchema>

export type CreateVoucherInput = z.infer<typeof createVoucherSchema>
export type UpdateVoucherInput = z.infer<typeof updateVoucherSchema>
export type VoucherQueryInput = z.infer<typeof voucherQuerySchema>

export type UpdateMarketingConfigInput = z.infer<typeof updateMarketingConfigSchema>

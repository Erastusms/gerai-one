import { apiClient } from "./client"

export interface CustomerBanner {
  id: string
  title: string
  subtitle?: string | null
  description?: string | null
  desktopImageUrl: string
  mobileImageUrl?: string | null
  redirectUrl?: string | null
  displayOrder: number
}

export interface CustomerVoucher {
  id: string
  code: string
  name: string
  description?: string | null
  discountType: "PERCENTAGE" | "FIXED_AMOUNT"
  discountValue: number
  maxDiscountAmount?: number | null
  minPurchaseAmount: number
}

export interface MarketingConfig {
  allowMultipleVouchers: boolean
}

export const bannerApi = {
  async getCustomerBanners(): Promise<CustomerBanner[]> {
    try {
      const response = await apiClient.get("/api/v1/banners")
      return response.data?.data || []
    } catch {
      return []
    }
  },
}

export const voucherApi = {
  async getCustomerVouchers(): Promise<CustomerVoucher[]> {
    try {
      const response = await apiClient.get("/api/v1/vouchers")
      return response.data?.data || []
    } catch {
      return []
    }
  },
  async getMarketingConfig(): Promise<MarketingConfig> {
    try {
      const response = await apiClient.get("/api/v1/marketing-config")
      return response.data?.data || { allowMultipleVouchers: false }
    } catch {
      return { allowMultipleVouchers: false }
    }
  },
}

import { apiClient } from "./client"
import { ApiResponse, PaginatedResult, UserProfile } from "@/types"

export interface QueryParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  brandId?: string
  categoryId?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export const adminApi = {
  // ── CUSTOMERS ──
  async getCustomers(params: QueryParams): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>("/api/v1/admin/customers", { params })
    return response.data
  },
  async getCustomerById(id: string): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>(`/api/v1/admin/customers/${id}`)
    return response.data
  },
  async updateCustomer(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.patch<ApiResponse<any>>(`/api/v1/admin/customers/${id}`, data)
    return response.data
  },

  // ── ADMIN USERS ──
  async getAdminUsers(params: QueryParams): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>("/api/v1/admin/admin-users", { params })
    return response.data
  },
  async createAdminUser(data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>("/api/v1/admin/admin-users", data)
    return response.data
  },
  async updateAdminUser(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.patch<ApiResponse<any>>(`/api/v1/admin/admin-users/${id}`, data)
    return response.data
  },

  // ── ROLES & PERMISSIONS ──
  async getRoles(): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>("/api/v1/admin/roles")
    return response.data
  },
  async createRole(data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>("/api/v1/admin/roles", data)
    return response.data
  },
  async updateRole(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.patch<ApiResponse<any>>(`/api/v1/admin/roles/${id}`, data)
    return response.data
  },
  async getPermissions(): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>("/api/v1/admin/permissions")
    return response.data
  },
  async updatePermissions(data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.patch<ApiResponse<any>>("/api/v1/admin/permissions", data)
    return response.data
  },

  // ── PRODUCTS ──
  async getProducts(params: QueryParams): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>("/api/v1/admin/products", { params })
    return response.data
  },
  async getProductById(id: string): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>(`/api/v1/admin/products/${id}`)
    return response.data
  },
  async createProduct(data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>("/api/v1/admin/products", data)
    return response.data
  },
  async updateProduct(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.patch<ApiResponse<any>>(`/api/v1/admin/products/${id}`, data)
    return response.data
  },
  async deleteProduct(id: string): Promise<ApiResponse<any>> {
    const response = await apiClient.delete<ApiResponse<any>>(`/api/v1/admin/products/${id}`)
    return response.data
  },

  // ── CATEGORIES ──
  async getCategories(params?: QueryParams): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>("/api/v1/admin/categories", { params })
    return response.data
  },
  async createCategory(data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>("/api/v1/admin/categories", data)
    return response.data
  },
  async updateCategory(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.patch<ApiResponse<any>>(`/api/v1/admin/categories/${id}`, data)
    return response.data
  },
  async deleteCategory(id: string): Promise<ApiResponse<any>> {
    const response = await apiClient.delete<ApiResponse<any>>(`/api/v1/admin/categories/${id}`)
    return response.data
  },

  // ── BRANDS ──
  async getBrands(params?: QueryParams): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>("/api/v1/admin/brands", { params })
    return response.data
  },
  async createBrand(data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>("/api/v1/admin/brands", data)
    return response.data
  },
  async updateBrand(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.patch<ApiResponse<any>>(`/api/v1/admin/brands/${id}`, data)
    return response.data
  },
  async deleteBrand(id: string): Promise<ApiResponse<any>> {
    const response = await apiClient.delete<ApiResponse<any>>(`/api/v1/admin/brands/${id}`)
    return response.data
  },

  // ── VARIANTS ──
  async getVariants(params?: QueryParams): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>("/api/v1/admin/variants", { params })
    return response.data
  },
  async createVariant(data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>("/api/v1/admin/variants", data)
    return response.data
  },
  async updateVariant(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.patch<ApiResponse<any>>(`/api/v1/admin/variants/${id}`, data)
    return response.data
  },
  async deleteVariant(id: string): Promise<ApiResponse<any>> {
    const response = await apiClient.delete<ApiResponse<any>>(`/api/v1/admin/variants/${id}`)
    return response.data
  },

  // ── ATTRIBUTES ──
  async getAttributes(): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>("/api/v1/admin/attributes")
    return response.data
  },
  async createAttribute(data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>("/api/v1/admin/attributes", data)
    return response.data
  },
  async updateAttribute(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.patch<ApiResponse<any>>(`/api/v1/admin/attributes/${id}`, data)
    return response.data
  },
  async deleteAttribute(id: string): Promise<ApiResponse<any>> {
    const response = await apiClient.delete<ApiResponse<any>>(`/api/v1/admin/attributes/${id}`)
    return response.data
  },

  // ── REVIEWS ──
  async getReviews(params?: QueryParams): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>("/api/v1/admin/reviews", { params })
    return response.data
  },
  async updateReview(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.patch<ApiResponse<any>>(`/api/v1/admin/reviews/${id}`, data)
    return response.data
  },
  async deleteReview(id: string): Promise<ApiResponse<any>> {
    const response = await apiClient.delete<ApiResponse<any>>(`/api/v1/admin/reviews/${id}`)
    return response.data
  },

  // ── SEO ──
  async getProductSeo(id: string): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>(`/api/v1/admin/products/${id}/seo`)
    return response.data
  },
  async updateProductSeo(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.patch<ApiResponse<any>>(`/api/v1/admin/products/${id}/seo`, data)
    return response.data
  },

  // ── BANNERS ──
  async getBanners(params?: QueryParams): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>("/api/v1/admin/banners", { params })
    return response.data
  },
  async getBannerById(id: string): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>(`/api/v1/admin/banners/${id}`)
    return response.data
  },
  async createBanner(data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>("/api/v1/admin/banners", data)
    return response.data
  },
  async updateBanner(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.patch<ApiResponse<any>>(`/api/v1/admin/banners/${id}`, data)
    return response.data
  },
  async deleteBanner(id: string): Promise<ApiResponse<any>> {
    const response = await apiClient.delete<ApiResponse<any>>(`/api/v1/admin/banners/${id}`)
    return response.data
  },

  // ── VOUCHERS ──
  async getVouchers(params?: QueryParams): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>("/api/v1/admin/vouchers", { params })
    return response.data
  },
  async getVoucherById(id: string): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>(`/api/v1/admin/vouchers/${id}`)
    return response.data
  },
  async createVoucher(data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>("/api/v1/admin/vouchers", data)
    return response.data
  },
  async updateVoucher(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.patch<ApiResponse<any>>(`/api/v1/admin/vouchers/${id}`, data)
    return response.data
  },
  async deleteVoucher(id: string): Promise<ApiResponse<any>> {
    const response = await apiClient.delete<ApiResponse<any>>(`/api/v1/admin/vouchers/${id}`)
    return response.data
  },

  // ── MARKETING CONFIG ──
  async getMarketingConfig(): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>("/api/v1/admin/marketing-config")
    return response.data
  },
  async updateMarketingConfig(data: any): Promise<ApiResponse<any>> {
    const response = await apiClient.patch<ApiResponse<any>>("/api/v1/admin/marketing-config", data)
    return response.data
  },

  // ── ADMIN AUTH ──
  async login(data: { identifier: string; password: string; rememberMe?: boolean }): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>("/api/v1/admin/auth/login", data)
    return response.data
  },
  async logout(): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>("/api/v1/admin/auth/logout")
    return response.data
  },
  async getMe(): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>("/api/v1/admin/auth/me")
    return response.data
  },
  async refresh(): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>("/api/v1/admin/auth/refresh")
    return response.data
  },
}

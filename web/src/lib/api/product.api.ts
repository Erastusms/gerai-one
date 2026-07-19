import { apiClient } from "./client";
import { ApiResponse, BackendProduct, ProductSearchQuery } from "@/types";

export const productApi = {
  /**
   * Retrieves products with search, pagination, filter, and sorting options.
   */
  async getProducts(params?: ProductSearchQuery): Promise<ApiResponse<BackendProduct[]>> {
    const response = await apiClient.get<ApiResponse<BackendProduct[]>>("/api/v1/products", {
      params,
    });
    return response.data;
  },

  /**
   * Retrieves dynamic filter options (categories, brands) based on search keyword.
   */
  async getFilterOptions(search?: string): Promise<ApiResponse<{ categories: any[]; brands: any[] }>> {
    const response = await apiClient.get<ApiResponse<{ categories: any[]; brands: any[] }>>("/api/v1/products/filter-options", {
      params: { search },
    });
    return response.data;
  },

  /**
   * Retrieves full catalog details for a single product by its slug.
   */
  async getProductBySlug(slug: string): Promise<ApiResponse<BackendProduct>> {
    const response = await apiClient.get<ApiResponse<BackendProduct>>(`/api/v1/products/${slug}`);
    return response.data;
  },
};

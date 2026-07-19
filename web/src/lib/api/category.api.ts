import { apiClient } from "./client";
import { ApiResponse, BackendCategory, BackendProduct } from "@/types";

export interface CategoryDetailResponse {
  category: BackendCategory;
  products: BackendProduct[];
}

export const categoryApi = {
  /**
   * Retrieves paginated list of categories.
   */
  async getCategories(params?: { page?: number; limit?: number }): Promise<ApiResponse<BackendCategory[]>> {
    const response = await apiClient.get<ApiResponse<BackendCategory[]>>("/api/v1/categories", {
      params,
    });
    return response.data;
  },

  /**
   * Retrieves category information and paginated products inside it.
   */
  async getCategoryBySlug(
    slug: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<CategoryDetailResponse>> {
    const response = await apiClient.get<ApiResponse<CategoryDetailResponse>>(`/api/v1/categories/${slug}`, {
      params,
    });
    return response.data;
  },
};

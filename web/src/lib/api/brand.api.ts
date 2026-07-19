import { apiClient } from "./client";
import { ApiResponse, Brand, BackendProduct } from "@/types";

export interface BrandDetailResponse {
  brand: Brand;
  products: BackendProduct[];
}

export const brandApi = {
  async getBrands(): Promise<ApiResponse<Brand[]>> {
    const response = await apiClient.get<ApiResponse<Brand[]>>("/api/v1/brands");
    return response.data;
  },

  async getBrandDetail(slug: string, params?: { page?: number; limit?: number }): Promise<ApiResponse<BrandDetailResponse>> {
    const response = await apiClient.get<ApiResponse<BrandDetailResponse>>(`/api/v1/brands/${slug}`, {
      params,
    });
    return response.data;
  },
};

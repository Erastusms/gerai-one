import { apiClient } from "./client";
import { ApiResponse, BackendProduct } from "@/types";

export const wishlistApi = {
  async getWishlist(params?: { page?: number; limit?: number }): Promise<ApiResponse<BackendProduct[]>> {
    const response = await apiClient.get<ApiResponse<BackendProduct[]>>("/api/v1/wishlist", {
      params,
    });
    return response.data;
  },

  async addToWishlist(productId: string): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>("/api/v1/wishlist", {
      productId,
    });
    return response.data;
  },

  async removeFromWishlist(productId: string): Promise<ApiResponse<any>> {
    const response = await apiClient.delete<ApiResponse<any>>(`/api/v1/wishlist/${productId}`);
    return response.data;
  },
};

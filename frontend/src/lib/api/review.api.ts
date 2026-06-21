import { apiClient } from "./client";
import { ApiResponse } from "@/types";

export interface BackendReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string | null;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  user?: {
    id: string;
    fullName: string | null;
    imageUrl: string | null;
  };
}

export const reviewApi = {
  async getProductReviews(
    productId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<BackendReview[]>> {
    const response = await apiClient.get<ApiResponse<BackendReview[]>>(
      `/api/v1/products/${productId}/reviews`,
      { params }
    );
    return response.data;
  },

  async createReview(data: {
    productId: string;
    rating: number;
    comment?: string | null;
  }): Promise<ApiResponse<BackendReview>> {
    const response = await apiClient.post<ApiResponse<BackendReview>>("/api/v1/reviews", data);
    return response.data;
  },

  async updateReview(
    reviewId: string,
    data: { rating?: number; comment?: string | null }
  ): Promise<ApiResponse<BackendReview>> {
    const response = await apiClient.put<ApiResponse<BackendReview>>(
      `/api/v1/reviews/${reviewId}`,
      data
    );
    return response.data;
  },

  async deleteReview(reviewId: string): Promise<ApiResponse<BackendReview>> {
    const response = await apiClient.delete<ApiResponse<BackendReview>>(
      `/api/v1/reviews/${reviewId}`
    );
    return response.data;
  },
};

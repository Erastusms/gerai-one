import { apiClient } from "./client";
import { ApiResponse, CartData } from "@/types";

export const cartApi = {
  async getCart(): Promise<ApiResponse<CartData>> {
    const response = await apiClient.get<ApiResponse<CartData>>("/api/v1/cart");
    return response.data;
  },

  async addToCart(productVariantId: string, quantity: number = 1): Promise<ApiResponse<CartData>> {
    const response = await apiClient.post<ApiResponse<CartData>>("/api/v1/cart/items", {
      productVariantId,
      quantity,
    });
    return response.data;
  },

  async updateQuantity(itemId: string, quantity: number): Promise<ApiResponse<CartData>> {
    const response = await apiClient.patch<ApiResponse<CartData>>(`/api/v1/cart/items/${itemId}`, {
      quantity,
    });
    return response.data;
  },

  async removeItem(itemId: string): Promise<ApiResponse<CartData>> {
    const response = await apiClient.delete<ApiResponse<CartData>>(`/api/v1/cart/items/${itemId}`);
    return response.data;
  },

  async removeAllItems(): Promise<ApiResponse<CartData>> {
    const response = await apiClient.delete<ApiResponse<CartData>>("/api/v1/cart/items");
    return response.data;
  },

  async selectItem(itemId: string, isSelected: boolean): Promise<ApiResponse<CartData>> {
    const response = await apiClient.patch<ApiResponse<CartData>>(`/api/v1/cart/items/${itemId}/select`, {
      isSelected,
    });
    return response.data;
  },

  async selectAll(isSelected: boolean): Promise<ApiResponse<CartData>> {
    const response = await apiClient.patch<ApiResponse<CartData>>("/api/v1/cart/select-all", {
      isSelected,
    });
    return response.data;
  },

  async removeSelected(): Promise<ApiResponse<CartData>> {
    const response = await apiClient.delete<ApiResponse<CartData>>("/api/v1/cart/selected");
    return response.data;
  },
};

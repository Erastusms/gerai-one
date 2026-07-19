import { apiClient } from "./client";
import { ApiResponse, Address } from "@/types";

export const addressApi = {
  async getAddresses(): Promise<ApiResponse<Address[]>> {
    const response = await apiClient.get<ApiResponse<Address[]>>("/api/v1/addresses");
    return response.data;
  },

  async createAddress(data: Omit<Address, "id" | "userId" | "isDeleted" | "createdAt" | "updatedAt">): Promise<ApiResponse<Address>> {
    const response = await apiClient.post<ApiResponse<Address>>("/api/v1/addresses", data);
    return response.data;
  },

  async updateAddress(
    id: string,
    data: Partial<Omit<Address, "id" | "userId" | "isDeleted" | "createdAt" | "updatedAt">>
  ): Promise<ApiResponse<Address>> {
    const response = await apiClient.patch<ApiResponse<Address>>(`/api/v1/addresses/${id}`, data);
    return response.data;
  },

  async deleteAddress(id: string): Promise<ApiResponse<Address>> {
    const response = await apiClient.delete<ApiResponse<Address>>(`/api/v1/addresses/${id}`);
    return response.data;
  },

  async setDefaultAddress(id: string): Promise<ApiResponse<Address>> {
    const response = await apiClient.patch<ApiResponse<Address>>(`/api/v1/addresses/${id}/default`);
    return response.data;
  },
};

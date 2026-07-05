import { apiClient } from "./client";
import { ApiResponse, CustomerProfile } from "@/types";

export const profileApi = {
  async getProfile(): Promise<ApiResponse<CustomerProfile>> {
    const response = await apiClient.get<ApiResponse<CustomerProfile>>("/api/v1/profile");
    return response.data;
  },

  async updateProfile(data: Partial<CustomerProfile>): Promise<ApiResponse<CustomerProfile>> {
    const response = await apiClient.patch<ApiResponse<CustomerProfile>>("/api/v1/profile", data);
    return response.data;
  },
};

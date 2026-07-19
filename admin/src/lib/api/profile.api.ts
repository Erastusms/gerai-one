import { apiClient } from "./client"
import { ApiResponse, UserProfile } from "@/types"

export const profileApi = {
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    const response = await apiClient.get<ApiResponse<UserProfile>>("/api/v1/profile")
    return response.data
  },
}

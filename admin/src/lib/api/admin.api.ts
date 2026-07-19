import { apiClient } from "./client"
import { ApiResponse, PaginatedResult, UserProfile } from "@/types"

export interface UserListParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export const adminApi = {
  async getUsers(params: UserListParams): Promise<ApiResponse<PaginatedResult<UserProfile>>> {
    const response = await apiClient.get<ApiResponse<PaginatedResult<UserProfile>>>("/api/v1/admin/users", {
      params,
    })
    return response.data
  },
}

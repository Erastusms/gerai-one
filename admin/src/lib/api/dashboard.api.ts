import { apiClient } from "./client"
import { ApiResponse, DashboardOverviewData } from "@/types"

export const dashboardApi = {
  /**
   * Fetches the dashboard overview analytics metrics from the Fastify backend.
   */
  async getOverview(): Promise<ApiResponse<DashboardOverviewData>> {
    const response = await apiClient.get<ApiResponse<DashboardOverviewData>>("/api/v1/admin/dashboard/overview")
    return response.data
  },
}

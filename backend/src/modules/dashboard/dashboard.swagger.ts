import { dashboardOverviewResponseSchema } from "./dashboard.schema"
import { apiSuccessResponseSchema, apiErrorResponseSchema } from "../auth/auth.schema"

export const getDashboardOverviewSwagger = {
  schema: {
    description: "Retrieve summary business statistics, transaction counts, and stock alert counts (Admin only)",
    tags: ["Admin Dashboard"],
    summary: "Get dashboard analytics overview",
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(dashboardOverviewResponseSchema).describe("Overview statistics retrieved successfully"),
      401: apiErrorResponseSchema.describe("Invalid session token"),
      403: apiErrorResponseSchema.describe("Insufficient permissions"),
    },
  },
}

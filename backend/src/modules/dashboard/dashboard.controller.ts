import { FastifyRequest, FastifyReply } from "fastify"
import { dashboardService } from "./dashboard.service"
import { createSuccessResponse } from "../../shared/responses"

export class DashboardController {
  /**
   * Retrieves administrative overview statistics.
   */
  async handleGetOverview(_request: FastifyRequest, reply: FastifyReply) {
    const stats = await dashboardService.getOverview()
    return reply.status(200).send(
      createSuccessResponse("Dashboard overview statistics retrieved successfully", stats)
    )
  }
}

export const dashboardController = new DashboardController()

import { prisma } from "../../shared/database"
import { config } from "../../shared/config"
import { DashboardOverviewResponse } from "./dashboard.schema"

export class DashboardService {
  /**
   * Fetches all dashboard analytics metrics in parallel using optimized prisma count queries.
   */
  async getOverview(): Promise<DashboardOverviewResponse> {
    const now = new Date()
    const threshold = config.LOW_STOCK_THRESHOLD

    const [
      totalCustomers,
      totalProducts,
      activeProducts,
      inactiveProducts,
      totalCategories,
      totalBrands,
      pendingCheckout,
      pendingPayment,
      completedOrders,
      cancelledOrders,
      lowStockProducts,
      outOfStockProducts,
    ] = await Promise.all([
      // 1. Total Customers (role = USER, not deleted)
      prisma.user.count({
        where: {
          role: "USER",
          deletedAt: null,
        },
      }),
      // 2. Total Products (not deleted)
      prisma.product.count({
        where: {
          deletedAt: null,
        },
      }),
      // 3. Active Products (is_active = true, not deleted)
      prisma.product.count({
        where: {
          isActive: true,
          deletedAt: null,
        },
      }),
      // 4. Inactive Products (is_active = false, not deleted)
      prisma.product.count({
        where: {
          isActive: false,
          deletedAt: null,
        },
      }),
      // 5. Total Categories (not deleted)
      prisma.category.count({
        where: {
          deletedAt: null,
        },
      }),
      // 6. Total Brands (not deleted)
      prisma.brand.count({
        where: {
          deletedAt: null,
        },
      }),
      // 7. Pending Checkout (status = PENDING, shippingServiceId is null, not expired)
      prisma.checkoutSession.count({
        where: {
          status: "PENDING",
          shippingServiceId: null,
          expiresAt: {
            gt: now,
          },
        },
      }),
      // 8. Pending Payment (status = PENDING, shippingServiceId is not null, not expired)
      prisma.checkoutSession.count({
        where: {
          status: "PENDING",
          shippingServiceId: {
            not: null,
          },
          expiresAt: {
            gt: now,
          },
        },
      }),
      // 9. Completed Orders (status = COMPLETED)
      prisma.checkoutSession.count({
        where: {
          status: "COMPLETED",
        },
      }),
      // 10. Cancelled Orders (status = CANCELLED)
      prisma.checkoutSession.count({
        where: {
          status: "CANCELLED",
        },
      }),
      // 11. Low Stock Products (availableStock <= threshold, availableStock > 0)
      prisma.inventory.count({
        where: {
          availableStock: {
            lte: threshold,
            gt: 0,
          },
        },
      }),
      // 12. Out of Stock Products (availableStock <= 0)
      prisma.inventory.count({
        where: {
          availableStock: {
            lte: 0,
          },
        },
      }),
    ])

    // Fulfillment processing & shipped counts (mocked to 0 for now as they require fulfillment columns)
    const processingOrders = 0
    const shippedOrders = 0

    return {
      totalCustomers,
      totalProducts,
      activeProducts,
      inactiveProducts,
      pendingCheckout,
      pendingPayment,
      processingOrders,
      shippedOrders,
      completedOrders,
      cancelledOrders,
      totalCategories,
      totalBrands,
      lowStockProducts,
      outOfStockProducts,
    }
  }
}

export const dashboardService = new DashboardService()

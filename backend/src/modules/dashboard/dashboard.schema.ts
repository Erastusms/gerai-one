import { z } from "zod"

export const dashboardOverviewResponseSchema = z.object({
  totalCustomers: z.number().int().nonnegative(),
  totalProducts: z.number().int().nonnegative(),
  activeProducts: z.number().int().nonnegative(),
  inactiveProducts: z.number().int().nonnegative(),
  pendingCheckout: z.number().int().nonnegative(),
  pendingPayment: z.number().int().nonnegative(),
  processingOrders: z.number().int().nonnegative(),
  shippedOrders: z.number().int().nonnegative(),
  completedOrders: z.number().int().nonnegative(),
  cancelledOrders: z.number().int().nonnegative(),
  totalCategories: z.number().int().nonnegative(),
  totalBrands: z.number().int().nonnegative(),
  lowStockProducts: z.number().int().nonnegative(),
  outOfStockProducts: z.number().int().nonnegative(),
})

export type DashboardOverviewResponse = z.infer<typeof dashboardOverviewResponseSchema>

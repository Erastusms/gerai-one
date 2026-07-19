export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: any
}

export type Role = "USER" | "ADMIN" | "SUPER_ADMIN"

export interface UserProfile {
  id: string
  clerkUserId: string
  email: string
  fullName: string | null
  username: string | null
  phoneNumber: string | null
  gender: string | null
  dateOfBirth: string | null
  profilePhoto: string | null
  isProfileCompleted: boolean
  role: Role
  status: "ACTIVE" | "INACTIVE"
  createdAt: string
  updatedAt: string
}

export interface PaginatedResult<T> {
  users: T[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export interface DashboardOverviewData {
  totalCustomers: number
  totalProducts: number
  activeProducts: number
  inactiveProducts: number
  pendingCheckout: number
  pendingPayment: number
  processingOrders: number
  shippedOrders: number
  completedOrders: number
  cancelledOrders: number
  totalCategories: number
  totalBrands: number
  lowStockProducts: number
  outOfStockProducts: number
}

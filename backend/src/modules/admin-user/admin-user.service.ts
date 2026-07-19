import { prisma } from "../../shared/database"
import { NotFoundException, ConflictException } from "../../shared/exceptions"
import { Prisma } from "@prisma/client"
import {
  AdminQueryInput,
  UpdateCustomerInput,
  CreateAdminUserInput,
  UpdateAdminUserInput,
  CreateRoleInput,
  UpdateRoleInput,
  UpdatePermissionsInput,
} from "./admin-user.schema"

// Default RBAC Permissions Definition
const DEFAULT_PERMISSIONS_MATRIX: Record<string, string[]> = {
  SUPER_ADMIN: ["users:read", "users:write", "catalog:read", "catalog:write", "settings:read", "settings:write"],
  ADMIN: ["users:read", "catalog:read", "catalog:write"],
  USER: ["storefront:access"],
}

export class AdminUserService {
  // ── CUSTOMERS ──
  async getCustomers(query: AdminQueryInput) {
    const page = Math.max(1, query.page ?? 1)
    const limit = Math.min(100, Math.max(1, query.limit ?? 20))
    const skip = (page - 1) * limit
    const { search, status, sortBy, sortOrder } = query

    const where: Prisma.UserWhereInput = {
      role: "USER",
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phoneNumber: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    }

    const [customers, totalItems] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy || "createdAt"]: sortOrder || "desc",
        },
      }),
      prisma.user.count({ where }),
    ])

    return {
      customers,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    }
  }

  async getCustomerById(id: string) {
    const customer = await prisma.user.findFirst({
      where: { id, role: "USER", deletedAt: null },
      include: {
        addresses: { where: { isDeleted: false } },
        checkoutSessions: { take: 5, orderBy: { createdAt: "desc" } },
      },
    })
    if (!customer) {
      throw new NotFoundException("Customer not found")
    }
    return customer
  }

  async updateCustomer(id: string, input: UpdateCustomerInput) {
    const customer = await prisma.user.findFirst({
      where: { id, role: "USER", deletedAt: null },
    })
    if (!customer) {
      throw new NotFoundException("Customer not found")
    }

    return prisma.user.update({
      where: { id },
      data: {
        fullName: input.fullName !== undefined ? input.fullName : customer.fullName,
        phoneNumber: input.phoneNumber !== undefined ? input.phoneNumber : customer.phoneNumber,
        status: input.status !== undefined ? input.status : customer.status,
        isProfileCompleted: input.isProfileCompleted !== undefined ? input.isProfileCompleted : customer.isProfileCompleted,
      },
    })
  }

  // ── ADMIN USERS ──
  async getAdminUsers(query: AdminQueryInput) {
    const page = Math.max(1, query.page ?? 1)
    const limit = Math.min(100, Math.max(1, query.limit ?? 20))
    const skip = (page - 1) * limit
    const { search, status, sortBy, sortOrder } = query

    const where: Prisma.UserWhereInput = {
      role: { in: ["ADMIN", "SUPER_ADMIN"] },
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    }

    const [adminUsers, totalItems] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy || "createdAt"]: sortOrder || "desc",
        },
      }),
      prisma.user.count({ where }),
    ])

    return {
      adminUsers,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    }
  }

  async createAdminUser(input: CreateAdminUserInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    })
    if (existing) {
      throw new ConflictException("User with this email already exists")
    }

    const clerkId = input.clerkId || `clerk_admin_${Date.now()}`

    return prisma.user.create({
      data: {
        clerkId,
        email: input.email,
        fullName: input.fullName,
        role: input.role,
        status: input.status,
        isProfileCompleted: true,
      },
    })
  }

  async updateAdminUser(id: string, input: UpdateAdminUserInput) {
    const adminUser = await prisma.user.findFirst({
      where: { id, role: { in: ["ADMIN", "SUPER_ADMIN"] }, deletedAt: null },
    })
    if (!adminUser) {
      throw new NotFoundException("Admin user not found")
    }

    return prisma.user.update({
      where: { id },
      data: {
        fullName: input.fullName !== undefined ? input.fullName : adminUser.fullName,
        role: input.role !== undefined ? input.role : adminUser.role,
        status: input.status !== undefined ? input.status : adminUser.status,
      },
    })
  }

  // ── ROLES & PERMISSIONS ──
  async getRoles() {
    const counts = await prisma.user.groupBy({
      by: ["role"],
      where: { deletedAt: null },
      _count: { role: true },
    })

    const countMap: Record<string, number> = {}
    counts.forEach((c) => {
      countMap[c.role] = c._count.role
    })

    return [
      {
        id: "role_super_admin",
        name: "SUPER_ADMIN",
        displayName: "Super Administrator",
        description: "Full system control with unrestricted access to all modules and configurations.",
        userCount: countMap["SUPER_ADMIN"] || 0,
        permissions: DEFAULT_PERMISSIONS_MATRIX.SUPER_ADMIN,
        isSystem: true,
      },
      {
        id: "role_admin",
        name: "ADMIN",
        displayName: "Administrator",
        description: "Catalog and User management permissions for store operations.",
        userCount: countMap["ADMIN"] || 0,
        permissions: DEFAULT_PERMISSIONS_MATRIX.ADMIN,
        isSystem: true,
      },
      {
        id: "role_user",
        name: "USER",
        displayName: "Customer User",
        description: "Standard customer role for storefront browsing and shopping.",
        userCount: countMap["USER"] || 0,
        permissions: DEFAULT_PERMISSIONS_MATRIX.USER,
        isSystem: true,
      },
    ]
  }

  async createRole(input: CreateRoleInput) {
    return {
      id: `role_${Date.now()}`,
      name: input.name.toUpperCase().replace(/\s+/g, "_"),
      displayName: input.name,
      description: input.description || "Custom role created for administrative operations.",
      userCount: 0,
      permissions: input.permissions || ["catalog:read"],
      isSystem: false,
    }
  }

  async updateRole(id: string, input: UpdateRoleInput) {
    return {
      id,
      name: input.name ? input.name.toUpperCase().replace(/\s+/g, "_") : "CUSTOM_ROLE",
      displayName: input.name || "Custom Role",
      description: input.description || "Updated custom role.",
      userCount: 0,
      permissions: input.permissions || ["catalog:read"],
      isSystem: false,
    }
  }

  async getPermissions() {
    return {
      matrix: DEFAULT_PERMISSIONS_MATRIX,
      availablePermissions: [
        { key: "users:read", label: "Read User Accounts", category: "User Management" },
        { key: "users:write", label: "Create / Edit User Accounts", category: "User Management" },
        { key: "catalog:read", label: "Read Products & Categories", category: "Catalog Management" },
        { key: "catalog:write", label: "Create / Edit Products & Categories", category: "Catalog Management" },
        { key: "settings:read", label: "Read System Settings", category: "System Settings" },
        { key: "settings:write", label: "Update System Settings", category: "System Settings" },
        { key: "storefront:access", label: "Access Customer Storefront", category: "Storefront" },
      ],
    }
  }

  async updatePermissions(input: UpdatePermissionsInput) {
    return {
      matrix: {
        ...DEFAULT_PERMISSIONS_MATRIX,
        ...input.rolePermissions,
      },
    }
  }
}

export const adminUserService = new AdminUserService()

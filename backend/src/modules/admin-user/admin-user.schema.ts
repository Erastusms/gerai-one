import { z } from "zod"

export const adminQuerySchema = z.object({
  page: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().min(1)).optional(),
  limit: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().min(1).max(100)).optional(),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
})

export type AdminQueryInput = z.infer<typeof adminQuerySchema>

export const updateCustomerSchema = z.object({
  fullName: z.string().max(100).optional().nullable(),
  phoneNumber: z.string().max(20).optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  isProfileCompleted: z.boolean().optional(),
})

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>

export const createAdminUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1).max(100),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]).default("ADMIN"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  clerkId: z.string().optional(),
})

export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>

export const updateAdminUserSchema = z.object({
  fullName: z.string().max(100).optional(),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
})

export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>

export const createRoleSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(255).optional(),
  permissions: z.array(z.string()).optional(),
})

export type CreateRoleInput = z.infer<typeof createRoleSchema>

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(255).optional(),
  permissions: z.array(z.string()).optional(),
})

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>

export const updatePermissionsSchema = z.object({
  rolePermissions: z.record(z.string(), z.array(z.string())),
})

export type UpdatePermissionsInput = z.infer<typeof updatePermissionsSchema>

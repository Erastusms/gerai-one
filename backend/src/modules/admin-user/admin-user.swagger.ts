import { apiSuccessResponseSchema, apiErrorResponseSchema } from "../auth/auth.schema"
import {
  adminQuerySchema,
  updateCustomerSchema,
  createAdminUserSchema,
  updateAdminUserSchema,
  createRoleSchema,
  updateRoleSchema,
  updatePermissionsSchema,
} from "./admin-user.schema"
import { z } from "zod"

export const getCustomersSwagger = {
  schema: {
    description: "Retrieve paginated list of customers (Admin only)",
    tags: ["Admin User Management"],
    summary: "Get customer list",
    security: [{ BearerAuth: [] }],
    querystring: adminQuerySchema,
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Customers retrieved successfully"),
      401: apiErrorResponseSchema.describe("Invalid session token"),
    },
  },
}

export const getCustomerByIdSwagger = {
  schema: {
    description: "Retrieve customer detail by ID (Admin only)",
    tags: ["Admin User Management"],
    summary: "Get customer detail",
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Customer detail retrieved"),
      404: apiErrorResponseSchema.describe("Customer not found"),
    },
  },
}

export const updateCustomerSwagger = {
  schema: {
    description: "Update customer status or profile details (Admin only)",
    tags: ["Admin User Management"],
    summary: "Update customer",
    security: [{ BearerAuth: [] }],
    body: updateCustomerSchema,
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Customer updated successfully"),
    },
  },
}

export const getAdminUsersSwagger = {
  schema: {
    description: "Retrieve list of administrative users (Admin only)",
    tags: ["Admin User Management"],
    summary: "Get admin users",
    security: [{ BearerAuth: [] }],
    querystring: adminQuerySchema,
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Admin users retrieved"),
    },
  },
}

export const createAdminUserSwagger = {
  schema: {
    description: "Create a new administrative user (Admin only)",
    tags: ["Admin User Management"],
    summary: "Create admin user",
    security: [{ BearerAuth: [] }],
    body: createAdminUserSchema,
    response: {
      201: apiSuccessResponseSchema(z.any()).describe("Admin user created"),
    },
  },
}

export const updateAdminUserSwagger = {
  schema: {
    description: "Update administrative user (Admin only)",
    tags: ["Admin User Management"],
    summary: "Update admin user",
    security: [{ BearerAuth: [] }],
    body: updateAdminUserSchema,
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Admin user updated"),
    },
  },
}

export const getRolesSwagger = {
  schema: {
    description: "Retrieve available system roles (Admin only)",
    tags: ["Admin User Management"],
    summary: "Get roles",
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Roles retrieved"),
    },
  },
}

export const createRoleSwagger = {
  schema: {
    description: "Create a custom role (Admin only)",
    tags: ["Admin User Management"],
    summary: "Create role",
    security: [{ BearerAuth: [] }],
    body: createRoleSchema,
    response: {
      201: apiSuccessResponseSchema(z.any()).describe("Role created"),
    },
  },
}

export const updateRoleSwagger = {
  schema: {
    description: "Update a role (Admin only)",
    tags: ["Admin User Management"],
    summary: "Update role",
    security: [{ BearerAuth: [] }],
    body: updateRoleSchema,
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Role updated"),
    },
  },
}

export const getPermissionsSwagger = {
  schema: {
    description: "Retrieve permission matrix (Admin only)",
    tags: ["Admin User Management"],
    summary: "Get permissions",
    security: [{ BearerAuth: [] }],
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Permissions retrieved"),
    },
  },
}

export const updatePermissionsSwagger = {
  schema: {
    description: "Update permission matrix (Admin only)",
    tags: ["Admin User Management"],
    summary: "Update permissions",
    security: [{ BearerAuth: [] }],
    body: updatePermissionsSchema,
    response: {
      200: apiSuccessResponseSchema(z.any()).describe("Permissions updated"),
    },
  },
}

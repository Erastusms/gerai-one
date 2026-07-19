import { FastifyRequest, FastifyReply } from "fastify"
import { adminUserService } from "./admin-user.service"
import { createSuccessResponse } from "../../shared/responses"
import {
  AdminQueryInput,
  UpdateCustomerInput,
  CreateAdminUserInput,
  UpdateAdminUserInput,
  CreateRoleInput,
  UpdateRoleInput,
  UpdatePermissionsInput,
} from "./admin-user.schema"

export class AdminUserController {
  // Customers
  async handleGetCustomers(request: FastifyRequest<{ Querystring: AdminQueryInput }>, reply: FastifyReply) {
    const data = await adminUserService.getCustomers(request.query)
    return reply.status(200).send(createSuccessResponse("Customers retrieved successfully", data))
  }

  async handleGetCustomerById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const customer = await adminUserService.getCustomerById(request.params.id)
    return reply.status(200).send(createSuccessResponse("Customer retrieved successfully", customer))
  }

  async handleUpdateCustomer(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateCustomerInput }>,
    reply: FastifyReply
  ) {
    const customer = await adminUserService.updateCustomer(request.params.id, request.body)
    return reply.status(200).send(createSuccessResponse("Customer updated successfully", customer))
  }

  // Admin Users
  async handleGetAdminUsers(request: FastifyRequest<{ Querystring: AdminQueryInput }>, reply: FastifyReply) {
    const data = await adminUserService.getAdminUsers(request.query)
    return reply.status(200).send(createSuccessResponse("Admin users retrieved successfully", data))
  }

  async handleCreateAdminUser(request: FastifyRequest<{ Body: CreateAdminUserInput }>, reply: FastifyReply) {
    const adminUser = await adminUserService.createAdminUser(request.body)
    return reply.status(201).send(createSuccessResponse("Admin user created successfully", adminUser))
  }

  async handleUpdateAdminUser(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateAdminUserInput }>,
    reply: FastifyReply
  ) {
    const adminUser = await adminUserService.updateAdminUser(request.params.id, request.body)
    return reply.status(200).send(createSuccessResponse("Admin user updated successfully", adminUser))
  }

  // Roles & Permissions
  async handleGetRoles(_request: FastifyRequest, reply: FastifyReply) {
    const roles = await adminUserService.getRoles()
    return reply.status(200).send(createSuccessResponse("Roles retrieved successfully", roles))
  }

  async handleCreateRole(request: FastifyRequest<{ Body: CreateRoleInput }>, reply: FastifyReply) {
    const role = await adminUserService.createRole(request.body)
    return reply.status(201).send(createSuccessResponse("Role created successfully", role))
  }

  async handleUpdateRole(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateRoleInput }>,
    reply: FastifyReply
  ) {
    const role = await adminUserService.updateRole(request.params.id, request.body)
    return reply.status(200).send(createSuccessResponse("Role updated successfully", role))
  }

  async handleGetPermissions(_request: FastifyRequest, reply: FastifyReply) {
    const permissions = await adminUserService.getPermissions()
    return reply.status(200).send(createSuccessResponse("Permissions retrieved successfully", permissions))
  }

  async handleUpdatePermissions(request: FastifyRequest<{ Body: UpdatePermissionsInput }>, reply: FastifyReply) {
    const permissions = await adminUserService.updatePermissions(request.body)
    return reply.status(200).send(createSuccessResponse("Permissions updated successfully", permissions))
  }
}

export const adminUserController = new AdminUserController()

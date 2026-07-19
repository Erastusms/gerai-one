import { FastifyRequest, FastifyReply } from "fastify";
import { Role } from "@prisma/client";
import { ForbiddenException } from "../exceptions";

/**
 * Reusable role authorization middleware for Fastify routes.
 * Ensures the authenticated user has one of the specified roles.
 */
export function requireRoles(...allowedRoles: Role[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const user = request.user;
    
    if (!user) {
      throw new ForbiddenException("Access denied: Not authenticated");
    }
    
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException("Access denied: Insufficient permissions");
    }
  };
}

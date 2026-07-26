import { FastifyRequest, FastifyReply } from "fastify"
import jwt from "jsonwebtoken"
import { config } from "../config"
import { prisma } from "../database"
import { UnauthorizedException, ForbiddenException } from "../exceptions"
import { logger } from "../logger"

export interface AdminJwtPayload {
  userId: string
  email: string
  role: string
  tokenType: "access" | "refresh"
}

export async function adminAuthMiddleware(request: FastifyRequest, _reply: FastifyReply) {
  let token: string | undefined

  // 1. Check HttpOnly cookie first
  if (request.cookies && request.cookies.admin_access_token) {
    token = request.cookies.admin_access_token
  } else {
    // 2. Check Authorization header
    const authHeader = request.headers.authorization
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7)
    }
  }

  if (!token) {
    throw new UnauthorizedException("Admin authentication session missing or expired")
  }

  try {
    const decoded = jwt.verify(token, config.ADMIN_JWT_SECRET) as AdminJwtPayload

    if (decoded.tokenType !== "access") {
      throw new UnauthorizedException("Invalid token type for admin authorization")
    }

    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        deletedAt: null,
      },
    })

    if (!user) {
      logger.warn({ userId: decoded.userId }, "Admin JWT verified but local user was not found")
      throw new UnauthorizedException("Admin account not found")
    }

    if (user.status !== "ACTIVE") {
      logger.warn({ userId: user.id }, "Authenticated admin account is inactive")
      throw new UnauthorizedException("Admin account is disabled")
    }

    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      logger.warn({ userId: user.id, role: user.role }, "User role is not authorized for admin portal")
      throw new ForbiddenException("Access denied. Admin privileges required.")
    }

    // Attach user to request
    request.user = user
  } catch (error) {
    if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
      throw error
    }
    logger.error({ error }, "Admin JWT token verification failed")
    throw new UnauthorizedException("Invalid or expired admin authentication session")
  }
}

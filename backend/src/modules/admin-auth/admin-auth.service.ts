import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "../../shared/database"
import { config } from "../../shared/config"
import { UnauthorizedException } from "../../shared/exceptions"
import { logger } from "../../shared/logger"
import { LoginAdminInput } from "./admin-auth.schema"

export class AdminAuthService {
  async login(input: LoginAdminInput, ipAddress?: string, userAgent?: string) {
    const { identifier, password, rememberMe } = input

    // Search user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
        deletedAt: null,
      },
    })

    if (!user || !user.passwordHash) {
      await this.recordLoginLog(null, identifier, ipAddress, userAgent, "FAILED", "USER_NOT_FOUND_OR_NO_PASSWORD")
      throw new UnauthorizedException("Invalid username/email or password.")
    }

    // Role check: Only ADMIN and SUPER_ADMIN allowed
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      await this.recordLoginLog(user.id, identifier, ipAddress, userAgent, "FAILED", "ROLE_NOT_ALLOWED")
      throw new UnauthorizedException("Invalid username/email or password.")
    }

    // Status check
    if (user.status !== "ACTIVE") {
      await this.recordLoginLog(user.id, identifier, ipAddress, userAgent, "FAILED", "ACCOUNT_INACTIVE")
      throw new UnauthorizedException("Invalid username/email or password.")
    }

    // Password check using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      await this.recordLoginLog(user.id, identifier, ipAddress, userAgent, "FAILED", "INVALID_PASSWORD")
      throw new UnauthorizedException("Invalid username/email or password.")
    }

    // Login successful -> Audit log
    await this.recordLoginLog(user.id, identifier, ipAddress, userAgent, "SUCCESS")

    // Tokens generation
    const accessTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenType: "access",
    }

    const refreshTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenType: "refresh",
    }

    const accessToken = jwt.sign(accessTokenPayload, config.ADMIN_JWT_SECRET, {
      expiresIn: config.ADMIN_JWT_EXPIRES_IN as any,
    })

    const refreshExpiresIn = rememberMe ? "30d" : (config.ADMIN_JWT_REFRESH_EXPIRES_IN as any)
    const refreshToken = jwt.sign(refreshTokenPayload, config.ADMIN_JWT_REFRESH_SECRET, {
      expiresIn: refreshExpiresIn,
    })

    logger.info({ userId: user.id, role: user.role }, "Admin user logged in successfully")

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    }
  }

  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, config.ADMIN_JWT_REFRESH_SECRET) as any

      if (decoded.tokenType !== "refresh") {
        throw new UnauthorizedException("Invalid refresh token type")
      }

      const user = await prisma.user.findFirst({
        where: {
          id: decoded.userId,
          deletedAt: null,
        },
      })

      if (!user || user.status !== "ACTIVE" || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        throw new UnauthorizedException("Invalid or revoked session")
      }

      const accessTokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        tokenType: "access",
      }

      const newAccessToken = jwt.sign(accessTokenPayload, config.ADMIN_JWT_SECRET, {
        expiresIn: config.ADMIN_JWT_EXPIRES_IN as any,
      })

      return {
        user: this.sanitizeUser(user),
        accessToken: newAccessToken,
      }
    } catch (err) {
      throw new UnauthorizedException("Invalid or expired refresh token")
    }
  }

  async getMe(userId: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
    })

    if (!user) {
      throw new UnauthorizedException("User profile not found")
    }

    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      throw new UnauthorizedException("Access denied. Admin privileges required.")
    }

    return this.sanitizeUser(user)
  }

  private async recordLoginLog(
    userId: string | null,
    identifier: string,
    ipAddress?: string,
    userAgent?: string,
    status: "SUCCESS" | "FAILED" = "FAILED",
    reason?: string
  ) {
    try {
      await prisma.adminLoginLog.create({
        data: {
          userId,
          identifier,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          status,
          reason: reason || null,
        },
      })
    } catch (error) {
      logger.error({ error }, "Failed to save AdminLoginLog")
    }
  }

  private sanitizeUser(user: any) {
    const { passwordHash, clerkId, ...sanitized } = user
    return sanitized
  }
}

export const adminAuthService = new AdminAuthService()

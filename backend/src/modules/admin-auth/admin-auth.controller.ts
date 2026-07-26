import { FastifyRequest, FastifyReply } from "fastify"
import { adminAuthService } from "./admin-auth.service"
import { loginAdminSchema, refreshTokenSchema } from "./admin-auth.schema"

export class AdminAuthController {
  async handleLogin(request: FastifyRequest, reply: FastifyReply) {
    const input = loginAdminSchema.parse(request.body)
    const ipAddress = request.ip || (request.headers["x-forwarded-for"] as string) || undefined
    const userAgent = (request.headers["user-agent"] as string) || undefined

    const result = await adminAuthService.login(input, ipAddress, userAgent)

    // Set HttpOnly Cookies
    const isProduction = process.env.NODE_ENV === "production"
    const maxAgeSeconds = input.rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60

    reply.setCookie("admin_access_token", result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeSeconds,
    })

    reply.setCookie("admin_refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeSeconds,
    })

    return reply.status(200).send({
      success: true,
      message: "Admin authentication successful",
      data: result,
    })
  }

  async handleLogout(_request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie("admin_access_token", { path: "/" })
    reply.clearCookie("admin_refresh_token", { path: "/" })

    return reply.status(200).send({
      success: true,
      message: "Logged out successfully",
    })
  }

  async handleGetMe(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user
    if (!user) {
      return reply.status(401).send({
        success: false,
        message: "Not authenticated",
      })
    }

    const adminProfile = await adminAuthService.getMe(user.id)

    return reply.status(200).send({
      success: true,
      message: "Admin profile retrieved successfully",
      data: adminProfile,
    })
  }

  async handleRefresh(request: FastifyRequest, reply: FastifyReply) {
    let token: string | undefined = request.cookies?.admin_refresh_token

    if (!token && request.body) {
      const parsed = refreshTokenSchema.safeParse(request.body)
      if (parsed.success && parsed.data.refreshToken) {
        token = parsed.data.refreshToken
      }
    }

    if (!token) {
      return reply.status(401).send({
        success: false,
        message: "Refresh token missing",
      })
    }

    const result = await adminAuthService.refreshToken(token)

    const isProduction = process.env.NODE_ENV === "production"
    reply.setCookie("admin_access_token", result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    })

    return reply.status(200).send({
      success: true,
      message: "Session refreshed successfully",
      data: result,
    })
  }
}

export const adminAuthController = new AdminAuthController()

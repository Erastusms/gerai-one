import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get("admin_access_token")?.value
  const refreshToken = request.cookies.get("admin_refresh_token")?.value

  const hasSession = Boolean(accessToken || refreshToken)

  // Public path
  const isLoginPage = pathname.startsWith("/login")

  // Static files or Next.js internal routes
  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"

  if (isStaticAsset) {
    return NextResponse.next()
  }

  // If trying to access protected route without session, redirect to /login
  if (!hasSession && !isLoginPage) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If logged in and trying to access /login, redirect to dashboard /
  if (hasSession && isLoginPage) {
    const dashboardUrl = new URL("/", request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

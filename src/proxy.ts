import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const secure = process.env.NODE_ENV === "production"
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: secure,
    cookieName: secure ? "__Secure-authjs.session-token" : "authjs.session-token",
  })

  if (pathname.startsWith("/account") && !token) {
    return NextResponse.redirect(new URL(`/auth/sign-in?callbackUrl=${pathname}`, req.url))
  }

  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL(`/auth/sign-in?callbackUrl=${pathname}`, req.url))
    }
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
}

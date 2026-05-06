import { NextResponse } from "next/server"

function peek(val: string | undefined, chars = 6): string {
  if (!val) return "MISSING"
  return `${val.slice(0, chars)}… (${val.length} chars)`
}

export async function GET() {
  return NextResponse.json({
    AUTH_SECRET: process.env.AUTH_SECRET ? `set (${process.env.AUTH_SECRET.length} chars)` : "MISSING",
    AUTH_URL: process.env.AUTH_URL ?? "MISSING",
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST ?? "MISSING",
    AUTH_GITHUB_ID: peek(process.env.AUTH_GITHUB_ID),
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET ? `set (${process.env.AUTH_GITHUB_SECRET.length} chars)` : "MISSING",
    AUTH_GOOGLE_ID: peek(process.env.AUTH_GOOGLE_ID),
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET ? `set (${process.env.AUTH_GOOGLE_SECRET.length} chars)` : "MISSING",
    DATABASE_URL: process.env.DATABASE_URL ? `set (starts: ${process.env.DATABASE_URL.slice(0, 20)}…)` : "MISSING",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "(not set — ok if AUTH_URL is set)",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "set" : "(not set — ok if AUTH_SECRET is set)",
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL ?? "(not set)",
    VERCEL_URL: process.env.VERCEL_URL ?? "(not set)",
  })
}

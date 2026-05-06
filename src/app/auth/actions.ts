"use server"

import { signIn, signOut } from "@/lib/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export async function signOutAction() {
  await signOut({ redirectTo: "/" })
}

function logEnvStatus(provider: string) {
  console.log(`[auth:${provider}] ENV CHECK`, {
    AUTH_SECRET: process.env.AUTH_SECRET ? `set (${process.env.AUTH_SECRET.length} chars)` : "MISSING",
    AUTH_URL: process.env.AUTH_URL ?? "MISSING",
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST ?? "not set",
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID ? `${process.env.AUTH_GITHUB_ID.slice(0, 6)}…` : "MISSING",
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET ? "set" : "MISSING",
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID ? `${process.env.AUTH_GOOGLE_ID.slice(0, 6)}…` : "MISSING",
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET ? "set" : "MISSING",
    VERCEL: process.env.VERCEL ?? "not set",
    NODE_ENV: process.env.NODE_ENV,
  })
}

export async function signInWithGitHub(formData: FormData) {
  const redirectTo = formData.get("redirectTo")?.toString() ?? "/"
  logEnvStatus("github")
  try {
    await signIn("github", { redirectTo })
  } catch (error) {
    if (error instanceof AuthError) {
      console.error("[auth:github] AuthError caught", { type: error.type, message: error.message })
      redirect(`/auth/sign-in?error=${encodeURIComponent(error.type ?? "OAuthSignin")}`)
    }
    const digest = (error as { digest?: string }).digest
    if (digest?.startsWith("NEXT_REDIRECT")) {
      const redirectTarget = digest.split(";")[2]
      console.log("[auth:github] Redirecting to", redirectTarget)
    } else {
      console.error("[auth:github] Unexpected error", error)
    }
    throw error
  }
}

export async function signInWithGoogle(formData: FormData) {
  const redirectTo = formData.get("redirectTo")?.toString() ?? "/"
  logEnvStatus("google")
  try {
    await signIn("google", { redirectTo })
  } catch (error) {
    if (error instanceof AuthError) {
      console.error("[auth:google] AuthError caught", { type: error.type, message: error.message })
      redirect(`/auth/sign-in?error=${encodeURIComponent(error.type ?? "OAuthSignin")}`)
    }
    const digest = (error as { digest?: string }).digest
    if (digest?.startsWith("NEXT_REDIRECT")) {
      const redirectTarget = digest.split(";")[2]
      console.log("[auth:google] Redirecting to", redirectTarget)
    } else {
      console.error("[auth:google] Unexpected error", error)
    }
    throw error
  }
}

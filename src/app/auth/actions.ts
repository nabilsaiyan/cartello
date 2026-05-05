"use server"

import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export async function signInWithGitHub(formData: FormData) {
  const redirectTo = formData.get("redirectTo")?.toString() ?? "/"
  try {
    await signIn("github", { redirectTo })
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/auth/sign-in?error=${encodeURIComponent(error.type ?? "OAuthSignin")}`)
    }
    throw error
  }
}

export async function signInWithGoogle(formData: FormData) {
  const redirectTo = formData.get("redirectTo")?.toString() ?? "/"
  try {
    await signIn("google", { redirectTo })
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/auth/sign-in?error=${encodeURIComponent(error.type ?? "OAuthSignin")}`)
    }
    throw error
  }
}

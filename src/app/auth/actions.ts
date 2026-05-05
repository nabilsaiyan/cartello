"use server"

import { signIn } from "@/lib/auth"

export async function signInWithGitHub(formData: FormData) {
  const redirectTo = formData.get("redirectTo")?.toString() ?? "/"
  await signIn("github", { redirectTo })
}

export async function signInWithGoogle(formData: FormData) {
  const redirectTo = formData.get("redirectTo")?.toString() ?? "/"
  await signIn("google", { redirectTo })
}

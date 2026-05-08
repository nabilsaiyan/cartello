import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"

const nameSchema = z.object({ name: z.string().min(1).max(80) })
const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
})

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()

  if ("name" in body) {
    const parsed = nameSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: parsed.data.name },
      select: { id: true, name: true, email: true },
    })
    return NextResponse.json(user)
  }

  if ("currentPassword" in body) {
    const parsed = passwordSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    if (!user?.password) {
      return NextResponse.json({ error: "Password change is not available for OAuth accounts" }, { status: 400 })
    }

    const valid = await bcrypt.compare(parsed.data.currentPassword, user.password)
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(parsed.data.newPassword, 12)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 })
}

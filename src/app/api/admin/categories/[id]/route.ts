import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

async function checkAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN" ? session : null
}

interface Ctx { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Ctx) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const { name } = await req.json()
  const category = await prisma.category.update({ where: { id }, data: { name } })
  return NextResponse.json(category)
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

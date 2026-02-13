import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || session.user?.role !== "ADMIN") return null
  return session
}

interface Ctx { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Ctx) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const { variants, ...data } = body

  // Delete existing variants and recreate
  await prisma.variant.deleteMany({ where: { productId: id } })
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      variants: { create: (variants ?? []).map(({ id: _id, ...v }: { id?: string } & Record<string, unknown>) => v) },
    },
    include: { variants: true },
  })
  return NextResponse.json(product)
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const address = await prisma.address.findFirst({ where: { id, userId: session.user.id } })
  if (!address) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (body.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    })
  }

  const updated = await prisma.address.update({ where: { id }, data: body })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const address = await prisma.address.findFirst({ where: { id, userId: session.user.id } })
  if (!address) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.address.delete({ where: { id } })

  if (address.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId: session.user.id },
      orderBy: { id: "asc" },
    })
    if (next) {
      await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } })
    }
  }

  return NextResponse.json({ ok: true })
}

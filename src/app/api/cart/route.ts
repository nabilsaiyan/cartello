import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([])

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true, variant: true },
  })
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { productId, variantId, quantity = 1 } = await req.json()

  const existing = await prisma.cartItem.findFirst({
    where: { userId: session.user.id, productId, variantId: variantId ?? null },
  })

  if (existing) {
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
      include: { product: true, variant: true },
    })
    return NextResponse.json(updated)
  }

  const item = await prisma.cartItem.create({
    data: { userId: session.user.id, productId, variantId: variantId ?? null, quantity },
    include: { product: true, variant: true },
  })
  return NextResponse.json(item, { status: 201 })
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await prisma.cartItem.deleteMany({ where: { userId: session.user.id } })
  return NextResponse.json({ ok: true })
}

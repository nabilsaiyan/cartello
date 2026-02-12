import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([])

  const items = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { category: true, variants: true, reviews: true } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(items.map((i) => i.product))
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { productId } = await req.json()
  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  })

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } })
    return NextResponse.json({ added: false })
  }

  await prisma.wishlist.create({ data: { userId: session.user.id, productId } })
  return NextResponse.json({ added: true })
}

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { reviewSchema } from "@/lib/validations"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = reviewSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 })

  const { productId } = body
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 })

  const existing = await prisma.review.findFirst({
    where: { userId: session.user.id, productId },
  })
  if (existing) return NextResponse.json({ error: "Already reviewed" }, { status: 409 })

  const review = await prisma.review.create({
    data: { userId: session.user.id, productId, ...parsed.data },
    include: { user: { select: { name: true, image: true } } },
  })
  return NextResponse.json(review, { status: 201 })
}

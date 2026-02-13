import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || session.user?.role !== "ADMIN") return null
  return session
}

export async function POST(req: Request) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const { variants, ...data } = body

  const product = await prisma.product.create({
    data: {
      ...data,
      variants: { create: variants ?? [] },
    },
    include: { variants: true },
  })
  return NextResponse.json(product, { status: 201 })
}

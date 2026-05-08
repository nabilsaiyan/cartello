import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const addressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
  })
  return NextResponse.json(addresses)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = addressSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    })
  }

  const hasExisting = await prisma.address.count({ where: { userId: session.user.id } })
  const address = await prisma.address.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
      isDefault: parsed.data.isDefault || hasExisting === 0,
    },
  })
  return NextResponse.json(address, { status: 201 })
}

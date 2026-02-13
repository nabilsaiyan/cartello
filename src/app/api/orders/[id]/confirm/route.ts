import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getStripe } from "@/lib/stripe"
import { sendOrderConfirmation } from "@/lib/email"
import type { OrderWithItems } from "@/types"

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const found = await prisma.order.findUnique({ where: { id } })
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Verify payment with Stripe before doing anything
  if (!found.stripePaymentId) return NextResponse.json({ error: "No payment" }, { status: 400 })
  const stripe = getStripe()
  const pi = await stripe.paymentIntents.retrieve(found.stripePaymentId)
  if (pi.status !== "succeeded") {
    return NextResponse.json({ error: "Payment not confirmed" }, { status: 400 })
  }

  // Already confirmed — idempotent
  if (found.status === "PROCESSING" || found.status === "SHIPPED" || found.status === "DELIVERED") {
    return NextResponse.json({ ok: true })
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status: "PROCESSING" },
    include: { items: { include: { product: true, variant: true } }, address: true, user: true },
  }) as OrderWithItems

  await sendOrderConfirmation(order).catch((err) => {
    console.error("Failed to send order confirmation email:", err?.message ?? err)
  })

  return NextResponse.json({ ok: true })
}

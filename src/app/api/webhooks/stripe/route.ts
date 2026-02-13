import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { sendOrderConfirmation } from "@/lib/email"
import type { OrderWithItems } from "@/types"

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  const stripe = getStripe()
  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as { id: string }
    const found = await prisma.order.findFirst({ where: { stripePaymentId: pi.id } })
    if (found) {
      const order = await prisma.order.update({
        where: { id: found.id },
        data: { status: "PROCESSING" },
        include: { items: { include: { product: true, variant: true } }, address: true, user: true },
      }) as OrderWithItems
      await sendOrderConfirmation(order).catch(console.error)
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as { id: string }
    const found = await prisma.order.findFirst({ where: { stripePaymentId: pi.id } }).catch(() => null)
    if (found) {
      await prisma.order.update({ where: { id: found.id }, data: { status: "CANCELLED" } }).catch(() => {})
    }
  }

  return NextResponse.json({ received: true })
}

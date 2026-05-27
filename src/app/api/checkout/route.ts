import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getStripe } from "@/lib/stripe"
import { FREE_SHIPPING_THRESHOLD, SHIPPING_RATES } from "@/lib/constants"
import { checkoutSchema } from "@/lib/validations"

export async function POST(req: Request) {
  const session = await auth()
  const body = await req.json()

  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 })

  const { email, address } = parsed.data
  const { cartItems, shippingMethod = "standard" } = body as { cartItems: Array<{ productId: string; variantId?: string; quantity: number; price: number; name: string }>; shippingMethod?: "standard" | "express" }

  if (!cartItems?.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 })

  const subtotal = cartItems.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0)
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATES[shippingMethod].price
  const total = subtotal + shippingCost

  const stripe = getStripe()
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100),
    currency: "eur",
    payment_method_types: ["card", "klarna"],
    metadata: {
      email,
      userId: session?.user?.id ?? "",
      shippingMethod,
    },
  })

  // Store address — for guests, upsert a shared guest account so userId is always valid
  let addressUserId = session?.user?.id
  if (!addressUserId) {
    const guest = await prisma.user.upsert({
      where: { email: "guest@cartello.com" },
      create: { email: "guest@cartello.com", name: "Guest" },
      update: {},
    })
    addressUserId = guest.id
  }
  const addressRecord = await prisma.address.create({
    data: { userId: addressUserId, ...address },
  })

  // Create pending order
  const order = await prisma.order.create({
    data: {
      userId: session?.user?.id ?? null,
      email,
      addressId: addressRecord.id,
      subtotal,
      shipping: shippingCost,
      total,
      stripePaymentId: paymentIntent.id,
      status: "PENDING",
      items: {
        create: cartItems.map((item: { productId: string; variantId?: string; quantity: number; price: number }) => ({
          productId: item.productId,
          variantId: item.variantId ?? null,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: { items: { include: { product: true, variant: true } }, address: true, user: true },
  })

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    orderId: order.id,
  })
}

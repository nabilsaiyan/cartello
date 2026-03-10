import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/Badge"
import { formatPrice } from "@/lib/utils"
import type { Metadata } from "next"

interface Props { params: Promise<{ id: string }> }
export const metadata: Metadata = { title: "Order Details" }

const statusVariant: Record<string, "success" | "warning" | "default" | "sale"> = {
  DELIVERED: "success", PROCESSING: "warning", SHIPPED: "warning",
  PENDING: "default", CANCELLED: "sale", REFUNDED: "default",
}

export default async function OrderDetailPage({ params }: Props) {
  const session = await auth()
  const { id } = await params

  const order = await prisma.order.findFirst({
    where: { id, userId: session!.user.id },
    include: {
      items: { include: { product: true, variant: true } },
      address: true,
    },
  })
  if (!order) notFound()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/account/orders" className="text-sm text-neutral-500 hover:text-neutral-900">← Orders</Link>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-neutral-400">
            {new Date(order.createdAt).toLocaleDateString("en-IE", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <Badge variant={statusVariant[order.status] ?? "default"}>{order.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-neutral-100 p-5">
            <h2 className="mb-4 font-semibold text-neutral-900">Items</h2>
            <ul className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    {item.product.images[0] && (
                      <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="64px" />
                    )}
                  </div>
                  <div className="flex flex-1 justify-between">
                    <div>
                      <p className="font-medium text-neutral-900">{item.product.name}</p>
                      {item.variant && (
                        <p className="text-sm text-neutral-400">
                          {[item.variant.size, item.variant.color].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-neutral-900">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-100 p-5">
            <h2 className="mb-3 font-semibold text-neutral-900">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Shipping</span><span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span></div>
              <div className="flex justify-between border-t border-neutral-100 pt-2 font-semibold">
                <span>Total</span><span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-100 p-5">
            <h2 className="mb-3 font-semibold text-neutral-900">Shipping Address</h2>
            <address className="text-sm text-neutral-600 not-italic leading-relaxed">
              {order.address.firstName} {order.address.lastName}<br />
              {order.address.address1}<br />
              {order.address.address2 && <>{order.address.address2}<br /></>}
              {order.address.city}, {order.address.postalCode}<br />
              {order.address.country}
            </address>
          </div>
          {order.trackingNumber && (
            <div className="rounded-2xl border border-neutral-100 p-5">
              <h2 className="mb-1 font-semibold text-neutral-900">Tracking</h2>
              <p className="text-sm font-mono text-neutral-700">{order.trackingNumber}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/Badge"
import { OrderStatusForm } from "@/components/admin/OrderStatusForm"

interface Props { params: Promise<{ id: string }> }

const statusVariant: Record<string, "success" | "warning" | "default" | "sale"> = {
  DELIVERED: "success", PROCESSING: "warning", SHIPPED: "warning",
  PENDING: "default", CANCELLED: "sale", REFUNDED: "default",
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: true, items: { include: { product: true, variant: true } }, address: true },
  })
  if (!order) notFound()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/orders" className="text-sm text-neutral-500">← Orders</Link>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-neutral-400">{new Date(order.createdAt).toLocaleDateString("en-IE", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <Badge variant={statusVariant[order.status] ?? "default"}>{order.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-neutral-100 p-5">
            <h2 className="mb-3 font-semibold">Items</h2>
            <ul className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-3">
                  <div className="relative h-14 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    {item.product.images[0] && <Image src={item.product.images[0]} alt={item.product.name} fill sizes="48px" className="object-cover" />}
                  </div>
                  <div className="flex flex-1 justify-between">
                    <div>
                      <p className="font-medium text-neutral-900">{item.product.name}</p>
                      {item.variant && <p className="text-xs text-neutral-400">{[item.variant.size, item.variant.color].filter(Boolean).join(" · ")}</p>}
                      <p className="text-xs text-neutral-500">Qty {item.quantity}</p>
                    </div>
                    <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t border-neutral-100 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-neutral-500"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-neutral-500"><span>Shipping</span><span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span></div>
              <div className="flex justify-between font-semibold"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-100 p-5">
            <h2 className="mb-3 font-semibold">Customer</h2>
            <p className="text-sm">{order.user?.name}</p>
            <p className="text-sm text-neutral-500">{order.user?.email}</p>
          </div>
          <div className="rounded-2xl border border-neutral-100 p-5">
            <h2 className="mb-3 font-semibold">Shipping</h2>
            <address className="text-sm not-italic text-neutral-600 leading-relaxed">
              {order.address.firstName} {order.address.lastName}<br />
              {order.address.address1}<br />
              {order.address.city}, {order.address.postalCode}
            </address>
          </div>
          <div className="rounded-2xl border border-neutral-100 p-5">
            <h2 className="mb-3 font-semibold">Update Status</h2>
            <OrderStatusForm orderId={order.id} currentStatus={order.status} />
          </div>
        </div>
      </div>
    </div>
  )
}

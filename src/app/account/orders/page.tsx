import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Badge } from "@/components/ui/Badge"
import { formatPrice } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "My Orders" }

const statusVariant: Record<string, "success" | "warning" | "default" | "sale"> = {
  DELIVERED: "success",
  PROCESSING: "warning",
  SHIPPED: "warning",
  PENDING: "default",
  CANCELLED: "sale",
  REFUNDED: "default",
}

export default async function OrdersPage() {
  const session = await auth()
  const orders = await prisma.order.findMany({
    where: { userId: session!.user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Orders</h1>
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-neutral-100 py-16 text-center">
          <p className="text-neutral-500">No orders yet</p>
          <Link href="/products" className="mt-3 inline-block text-sm font-medium text-neutral-900 underline">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-neutral-100 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-neutral-900">#{order.id.slice(-8).toUpperCase()}</p>
                    <Badge variant={statusVariant[order.status] ?? "default"}>{order.status}</Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-neutral-400">
                    {new Date(order.createdAt).toLocaleDateString("en-IE", { year: "numeric", month: "long", day: "numeric" })}
                    · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-neutral-900">{formatPrice(order.total)}</span>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="rounded-full border border-neutral-300 px-4 py-1.5 text-xs font-medium hover:bg-neutral-50"
                  >
                    View Details
                  </Link>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {order.items.slice(0, 3).map((item) => (
                  <span key={item.id} className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600">
                    {item.product.name}
                  </span>
                ))}
                {order.items.length > 3 && (
                  <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-400">
                    +{order.items.length - 3} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

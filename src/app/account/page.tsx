import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Package, Heart, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { formatPrice } from "@/lib/utils"

const statusVariant: Record<string, "success" | "warning" | "default" | "sale"> = {
  DELIVERED: "success",
  PROCESSING: "warning",
  SHIPPED: "warning",
  PENDING: "default",
  CANCELLED: "sale",
  REFUNDED: "default",
}

export default async function AccountDashboard() {
  const session = await auth()
  const userId = session!.user.id

  const [recentOrders, wishlistCount] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.wishlist.count({ where: { userId } }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">My Account</h1>
        <p className="mt-1 text-sm text-neutral-500">Welcome back, {session!.user.name?.split(" ")[0]}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-neutral-100 p-5">
          <div className="flex items-center gap-2 text-neutral-500">
            <Package className="h-4 w-4" />
            <span className="text-sm">Total Orders</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{recentOrders.length}</p>
        </div>
        <div className="rounded-2xl border border-neutral-100 p-5">
          <div className="flex items-center gap-2 text-neutral-500">
            <Heart className="h-4 w-4" />
            <span className="text-sm">Wishlisted</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{wishlistCount}</p>
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border border-neutral-100 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900">Recent Orders</h2>
          <Link href="/account/orders" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-neutral-500">No orders yet</p>
            <Link href="/products" className="mt-3 inline-block text-sm font-medium text-neutral-900 underline">
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {recentOrders.map((order) => (
              <li key={order.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-neutral-900">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-neutral-400">
                    {new Date(order.createdAt).toLocaleDateString("en-IE")} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant[order.status] ?? "default"}>{order.status}</Badge>
                  <span className="text-sm font-semibold">{formatPrice(order.total)}</span>
                  <Link href={`/account/orders/${order.id}`} className="text-xs text-neutral-500 hover:text-neutral-900">
                    View →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

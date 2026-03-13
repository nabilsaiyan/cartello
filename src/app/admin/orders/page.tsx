import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/Badge"

const statusVariant: Record<string, "success" | "warning" | "default" | "sale"> = {
  DELIVERED: "success", PROCESSING: "warning", SHIPPED: "warning",
  PENDING: "default", CANCELLED: "sale", REFUNDED: "default",
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Orders</h1>
      <div className="overflow-hidden rounded-2xl border border-neutral-100">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Order</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Customer</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Date</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Items</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Total</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3 font-mono font-medium text-neutral-900">#{o.id.slice(-8).toUpperCase()}</td>
                <td className="px-4 py-3 text-neutral-600">{o.user?.email ?? "—"}</td>
                <td className="px-4 py-3 text-neutral-500">{new Date(o.createdAt).toLocaleDateString("en-IE")}</td>
                <td className="px-4 py-3 text-neutral-600">{o.items.length}</td>
                <td className="px-4 py-3 font-semibold text-neutral-900">{formatPrice(o.total)}</td>
                <td className="px-4 py-3"><Badge variant={statusVariant[o.status] ?? "default"}>{o.status}</Badge></td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="text-xs text-neutral-500 hover:text-neutral-900">Manage →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="py-16 text-center text-neutral-400">No orders yet</div>}
      </div>
    </div>
  )
}

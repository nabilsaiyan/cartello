import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { AdminRevenueChart } from "@/components/admin/AdminRevenueChart"
import { AdminOrdersChart } from "@/components/admin/AdminOrdersChart"

export default async function AdminAnalyticsPage() {
  const [monthlyRevenue, monthlyOrders, topProducts] = await Promise.all([
    prisma.$queryRaw<{ month: string; revenue: number }[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') AS month,
        SUM(total)::float AS revenue
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt")
    `,
    prisma.$queryRaw<{ month: string; orders: number }[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') AS month,
        COUNT(*)::int AS orders
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt")
    `,
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ])

  const topProductIds = topProducts.map((p) => p.productId)
  const products = await prisma.product.findMany({ where: { id: { in: topProductIds } } })
  const topProductsWithName = topProducts.map((p) => ({
    ...p,
    name: products.find((pr) => pr.id === p.productId)?.name ?? "Unknown",
  }))

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-neutral-900">Analytics</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-100 p-5">
          <h2 className="mb-4 font-semibold text-neutral-900">Monthly Revenue</h2>
          <AdminRevenueChart data={monthlyRevenue} />
        </div>
        <div className="rounded-2xl border border-neutral-100 p-5">
          <h2 className="mb-4 font-semibold text-neutral-900">Monthly Orders</h2>
          <AdminOrdersChart data={monthlyOrders} />
        </div>
      </div>
      <div className="rounded-2xl border border-neutral-100 p-5">
        <h2 className="mb-4 font-semibold text-neutral-900">Top Products by Quantity Sold</h2>
        <ul className="divide-y divide-neutral-100">
          {topProductsWithName.map((p, i) => (
            <li key={p.productId} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-400">{i + 1}</span>
                <span className="text-sm font-medium text-neutral-900">{p.name}</span>
              </div>
              <span className="text-sm font-semibold text-neutral-700">{p._sum.quantity ?? 0} sold</span>
            </li>
          ))}
          {topProductsWithName.length === 0 && <p className="py-8 text-center text-sm text-neutral-400">No sales data yet</p>}
        </ul>
      </div>
    </div>
  )
}

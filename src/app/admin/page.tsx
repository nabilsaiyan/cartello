import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { Package, ShoppingBag, Users, TrendingUp } from "lucide-react"
import { AdminRevenueChart } from "@/components/admin/AdminRevenueChart"

export default async function AdminDashboard() {
  const [totalOrders, totalRevenue, totalCustomers, totalProducts, recentOrders, monthlyRevenue] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.product.count(),
    prisma.order.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Last 6 months revenue grouped by month
    prisma.$queryRaw<{ month: string; revenue: number }[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') AS month,
        SUM(total)::float AS revenue
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt")
    `,
  ])

  const stats = [
    { label: "Total Orders", value: totalOrders.toString(), icon: ShoppingBag },
    { label: "Revenue", value: formatPrice(totalRevenue._sum.total ?? 0), icon: TrendingUp },
    { label: "Customers", value: totalCustomers.toString(), icon: Users },
    { label: "Products", value: totalProducts.toString(), icon: Package },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-neutral-100 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">{s.label}</span>
              <s.icon className="h-4 w-4 text-neutral-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-neutral-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-neutral-100 p-5 lg:col-span-3">
          <h2 className="mb-4 font-semibold text-neutral-900">Revenue (last 6 months)</h2>
          <AdminRevenueChart data={monthlyRevenue} />
        </div>
        <div className="rounded-2xl border border-neutral-100 p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold text-neutral-900">Recent Orders</h2>
          <ul className="divide-y divide-neutral-100">
            {recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-xs font-medium text-neutral-900">#{o.id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-neutral-400">{o.items.length} item{o.items.length !== 1 ? "s" : ""}</p>
                </div>
                <span className="text-xs font-semibold">{formatPrice(o.total)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "USER" },
    include: { _count: { select: { orders: true } }, orders: { select: { total: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Customers</h1>
      <div className="overflow-hidden rounded-2xl border border-neutral-100">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Name</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Email</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Joined</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Orders</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Total Spent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {customers.map((c) => {
              const totalSpent = c.orders.reduce((sum, o) => sum + o.total, 0)
              return (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-neutral-900">{c.name ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-600">{c.email}</td>
                  <td className="px-4 py-3 text-neutral-500">{new Date(c.createdAt).toLocaleDateString("en-IE")}</td>
                  <td className="px-4 py-3 text-neutral-600">{c._count.orders}</td>
                  <td className="px-4 py-3 font-semibold text-neutral-900">{formatPrice(totalSpent)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {customers.length === 0 && <div className="py-16 text-center text-neutral-400">No customers yet</div>}
      </div>
    </div>
  )
}

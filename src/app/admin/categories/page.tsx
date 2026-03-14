import { prisma } from "@/lib/prisma"
import Image from "next/image"
import { AdminCategoryActions } from "@/components/admin/AdminCategoryActions"

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Categories</h1>
      <div className="overflow-hidden rounded-2xl border border-neutral-100">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Name</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Slug</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Products</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {c.image && (
                      <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-neutral-100">
                        <Image src={c.image} alt={c.name} fill sizes="32px" className="object-cover" />
                      </div>
                    )}
                    <span className="font-medium text-neutral-900">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-neutral-400">{c.slug}</td>
                <td className="px-4 py-3 text-neutral-600">{c._count.products}</td>
                <td className="px-4 py-3">
                  <AdminCategoryActions category={c} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

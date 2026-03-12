import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { DeleteProductButton } from "@/components/admin/DeleteProductButton"

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>
      <div className="overflow-hidden rounded-2xl border border-neutral-100">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Product</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Category</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Price</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Variants</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.map((p) => (
              <tr key={p.id} className="bg-white">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                      {p.images[0] && (
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="32px" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{p.name}</p>
                      <p className="text-xs text-neutral-400">{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-neutral-600">{p.category.name}</td>
                <td className="px-4 py-3 text-neutral-900">
                  {p.comparePrice && (
                    <span className="mr-1.5 text-xs text-neutral-400 line-through">{formatPrice(p.comparePrice)}</span>
                  )}
                  {formatPrice(p.price)}
                </td>
                <td className="px-4 py-3 text-neutral-600">{p.variants.length}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.featured ? "bg-blue-50 text-blue-700" : "bg-neutral-100 text-neutral-600"}`}>
                    {p.featured ? "Featured" : "Standard"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/products/${p.id}`} className="rounded-lg p-1.5 hover:bg-neutral-100">
                      <Pencil className="h-3.5 w-3.5 text-neutral-500" />
                    </Link>
                    <DeleteProductButton id={p.id} name={p.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="py-16 text-center text-neutral-400">No products yet</div>
        )}
      </div>
    </div>
  )
}

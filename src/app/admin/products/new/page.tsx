import { AdminProductForm } from "@/components/admin/AdminProductForm"
import { prisma } from "@/lib/prisma"

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })
  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">New Product</h1>
      <AdminProductForm categories={categories} />
    </div>
  )
}

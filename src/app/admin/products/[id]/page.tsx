import { AdminProductForm } from "@/components/admin/AdminProductForm"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

interface Props { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const [raw, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { variants: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ])
  if (!raw) notFound()

  const product = {
    ...raw,
    variants: raw.variants.map((v) => ({ id: v.id, size: v.size ?? "", color: v.color ?? "", stock: v.stock })),
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Edit Product</h1>
      <AdminProductForm categories={categories} product={product} />
    </div>
  )
}

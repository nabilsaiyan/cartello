import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/product/ProductCard"
import type { Metadata } from "next"
import type { ProductWithRelations } from "@/types"

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const cat = await prisma.category.findUnique({ where: { slug } })
  return { title: cat?.name ?? "Category" }
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  const category = await prisma.category.findUnique({ where: { slug } })
  if (!category) notFound()

  const products = await prisma.product.findMany({
    where: { categoryId: category.id, published: true },
    include: { category: true, variants: true, reviews: true },
    orderBy: { createdAt: "desc" },
  }) as ProductWithRelations[]

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Collection</p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-900">{category.name}</h1>
        <p className="mt-1 text-sm text-neutral-500">{products.length} products</p>
      </div>
      {products.length === 0 ? (
        <p className="py-20 text-center text-neutral-500">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
        </div>
      )}
    </div>
  )
}

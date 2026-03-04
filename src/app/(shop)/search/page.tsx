import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/product/ProductCard"
import type { ProductWithRelations } from "@/types"
import type { Metadata } from "next"

interface PageProps { searchParams: Promise<{ q?: string }> }

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams
  return { title: q ? `Search: ${q}` : "Search" }
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams

  let products: ProductWithRelations[] = []
  if (q && q.trim()) {
    products = await prisma.product.findMany({
      where: {
        published: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { tags: { has: q.toLowerCase() } },
        ],
      },
      include: { category: true, variants: true, reviews: true },
      take: 24,
    }) as ProductWithRelations[]
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <form method="GET" className="mb-10">
        <div className="flex max-w-xl gap-3">
          <input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search products…"
            autoFocus
            className="flex-1 rounded-full border border-neutral-200 px-5 py-3 text-sm outline-none focus:border-neutral-400"
          />
          <button
            type="submit"
            className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-700"
          >
            Search
          </button>
        </div>
      </form>

      {q && (
        <div className="mb-6">
          <h1 className="text-xl font-bold text-neutral-900">
            {products.length > 0 ? `${products.length} results for "${q}"` : `No results for "${q}"`}
          </h1>
        </div>
      )}

      {products.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
        </div>
      )}

      {q && products.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-neutral-500">Try a different search term or browse our categories.</p>
          <a href="/products" className="mt-4 inline-block rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white">
            Browse All Products
          </a>
        </div>
      )}
    </div>
  )
}

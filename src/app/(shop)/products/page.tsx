import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/product/ProductCard"
import { ProductCardSkeleton } from "@/components/ui/Skeleton"
import { SortSelect } from "@/components/product/SortSelect"
import { ProductFilters } from "@/components/product/ProductFilters"
import type { ProductWithRelations } from "@/types"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "All Products — Cartello",
  description: "Shop the full Cartello menswear collection — outerwear, essentials, accessories and new arrivals.",
}

interface PageProps {
  searchParams: Promise<{
    category?: string
    sort?: string
    minPrice?: string
    maxPrice?: string
    page?: string
    q?: string
  }>
}

async function getProducts(params: Awaited<PageProps["searchParams"]>): Promise<{ products: ProductWithRelations[]; total: number }> {
  const page = parseInt(params.page ?? "1")
  const limit = 12
  const sort = params.sort ?? "newest"

  const where = {
    published: true,
    ...(params.category && { category: { slug: params.category } }),
    ...(params.q && {
      OR: [
        { name: { contains: params.q, mode: "insensitive" as const } },
        { tags: { has: params.q } },
      ],
    }),
    ...((params.minPrice || params.maxPrice) && {
      price: {
        ...(params.minPrice && { gte: parseFloat(params.minPrice) }),
        ...(params.maxPrice && { lte: parseFloat(params.maxPrice) }),
      },
    }),
  }

  const orderBy =
    sort === "price_asc" ? { price: "asc" as const } :
    sort === "price_desc" ? { price: "desc" as const } :
    sort === "name_asc" ? { name: "asc" as const } :
    { createdAt: "desc" as const }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, variants: true, reviews: true },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return { products, total }
}

async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } })
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const [{ products, total }, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ])

  const page = parseInt(params.page ?? "1")
  const pages = Math.ceil(total / 12)

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = { ...params, ...overrides }
    const qs = Object.entries(p)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join("&")
    return `/products${qs ? `?${qs}` : ""}`
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 pb-16 sm:px-6 lg:px-8">
      {/* Single compact header — title + sort in one row */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-light text-neutral-900">
            {params.q ? `Results for "${params.q}"` : params.category ? categories.find(c => c.slug === params.category)?.name ?? "Products" : "All Products"}
          </h1>
          <p className="text-xs text-neutral-400">{total} product{total !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-neutral-500 sm:inline">Sort:</span>
          <Suspense fallback={null}>
            <SortSelect currentSort={params.sort} />
          </Suspense>
        </div>
      </div>

      <div className="flex gap-8">
        <Suspense fallback={null}>
          <ProductFilters categories={categories} />
        </Suspense>

        {/* Product grid */}
        <div className="flex-1">

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-lg font-medium text-neutral-900">No products found</p>
              <p className="mt-1 text-sm text-neutral-500">Try adjusting your filters</p>
              <a href="/products" className="mt-4 text-sm font-medium text-neutral-900 underline">Clear filters</a>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 8} index={i} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              {page > 1 && (
                <a href={buildUrl({ page: String(page - 1) })} className="rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50">← Prev</a>
              )}
              {Array.from({ length: Math.min(pages, 7) }).map((_, i) => {
                const p = i + 1
                return (
                  <a key={p} href={buildUrl({ page: String(p) })} className={`flex h-9 w-9 items-center justify-center rounded-full text-sm ${p === page ? "bg-neutral-900 text-white" : "border border-neutral-300 hover:bg-neutral-50"}`}>
                    {p}
                  </a>
                )
              })}
              {page < pages && (
                <a href={buildUrl({ page: String(page + 1) })} className="rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50">Next →</a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

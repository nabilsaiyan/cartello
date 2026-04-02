"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

interface Category { id: string; name: string; slug: string }

export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get("category") ?? ""
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "")

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined || v === "") params.delete(k)
      else params.set(k, v)
    })
    params.set("page", "1")
    return `/products?${params.toString()}`
  }

  function applyPrice() {
    const params = new URLSearchParams(searchParams.toString())
    if (minPrice) params.set("minPrice", minPrice); else params.delete("minPrice")
    if (maxPrice) params.set("maxPrice", maxPrice); else params.delete("maxPrice")
    params.set("page", "1")
    router.push(`/products?${params.toString()}`)
  }

  return (
    <aside className="hidden w-56 flex-shrink-0 lg:block">
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-neutral-900">Category</h3>
          <ul className="space-y-1.5">
            <li>
              <button
                onClick={() => router.push(buildUrl({ category: undefined }))}
                className={`block text-sm ${!currentCategory ? "font-medium text-neutral-900" : "text-neutral-500 hover:text-neutral-900"}`}
              >
                All Products
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => router.push(buildUrl({ category: cat.slug }))}
                  className={`block text-sm ${currentCategory === cat.slug ? "font-medium text-neutral-900" : "text-neutral-500 hover:text-neutral-900"}`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-neutral-900">Price Range</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
            />
            <span className="text-neutral-400">–</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
            />
          </div>
          <button
            onClick={applyPrice}
            className="mt-2 w-full rounded-full bg-neutral-900 py-2 text-xs font-semibold text-white hover:bg-neutral-700"
          >
            Apply
          </button>
          {(searchParams.get("minPrice") || searchParams.get("maxPrice")) && (
            <button
              onClick={() => { setMinPrice(""); setMaxPrice(""); router.push(buildUrl({ minPrice: undefined, maxPrice: undefined })) }}
              className="mt-1 w-full text-xs text-neutral-400 hover:text-neutral-700"
            >
              Clear price filter
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}

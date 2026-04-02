"use client"

import { useRouter, useSearchParams } from "next/navigation"

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name A–Z" },
]

export function SortSelect({ currentSort }: { currentSort?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", e.target.value)
    params.set("page", "1")
    router.push(`/products?${params.toString()}`)
  }

  return (
    <select
      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm focus:outline-none"
      defaultValue={currentSort ?? "newest"}
      onChange={handleChange}
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Category } from "@/generated/prisma/client"

interface Variant { id?: string; size: string; color: string; stock: number }
interface ProductData { id?: string; name: string; slug: string; description: string; price: number; comparePrice?: number | null; categoryId: string; featured: boolean; images: string[]; variants: Variant[] }
interface Props { categories: Category[]; product?: ProductData }

export function AdminProductForm({ categories, product }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ProductData>(
    product ?? { name: "", slug: "", description: "", price: 0, comparePrice: null, categoryId: categories[0]?.id ?? "", featured: false, images: [""], variants: [{ size: "", color: "", stock: 0 }] }
  )

  function setField<K extends keyof ProductData>(k: K, v: ProductData[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function addVariant() {
    setForm((f) => ({ ...f, variants: [...f.variants, { size: "", color: "", stock: 0 }] }))
  }

  function updateVariant(i: number, field: keyof Variant, value: string | number) {
    setForm((f) => {
      const variants = [...f.variants]
      variants[i] = { ...variants[i], [field]: value }
      return { ...f, variants }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const url = product?.id ? `/api/admin/products/${product.id}` : "/api/admin/products"
    const method = product?.id ? "PATCH" : "POST"
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    setSaving(false)
    if (res.ok) {
      toast.success(product?.id ? "Product updated" : "Product created")
      router.push("/admin/products")
      router.refresh()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Something went wrong")
    }
  }

  const inputCls = "w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm focus:border-neutral-400 focus:outline-none"
  const labelCls = "mb-1.5 block text-sm font-medium text-neutral-700"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Name</label>
          <input className={inputCls} value={form.name} onChange={(e) => { setField("name", e.target.value); setField("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")) }} required />
        </div>
        <div>
          <label className={labelCls}>Slug</label>
          <input className={inputCls} value={form.slug} onChange={(e) => setField("slug", e.target.value)} required />
        </div>
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea className={`${inputCls} min-h-[100px] resize-y`} value={form.description} onChange={(e) => setField("description", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Price (€)</label>
          <input type="number" step="0.01" className={inputCls} value={form.price} onChange={(e) => setField("price", parseFloat(e.target.value))} required />
        </div>
        <div>
          <label className={labelCls}>Compare Price (€)</label>
          <input type="number" step="0.01" className={inputCls} value={form.comparePrice ?? ""} onChange={(e) => setField("comparePrice", e.target.value ? parseFloat(e.target.value) : null)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Category</label>
          <select className={inputCls} value={form.categoryId} onChange={(e) => setField("categoryId", e.target.value)}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3 pt-7">
          <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setField("featured", e.target.checked)} className="h-4 w-4" />
          <label htmlFor="featured" className="text-sm font-medium text-neutral-700">Featured</label>
        </div>
      </div>
      <div>
        <label className={labelCls}>Images (URLs, one per line)</label>
        <textarea className={`${inputCls} min-h-[80px] resize-y font-mono text-xs`} value={form.images.join("\n")} onChange={(e) => setField("images", e.target.value.split("\n").filter(Boolean))} />
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className={`${labelCls} mb-0`}>Variants</label>
          <button type="button" onClick={addVariant} className="text-xs font-medium text-neutral-600 underline">+ Add</button>
        </div>
        <div className="space-y-2">
          {form.variants.map((v, i) => (
            <div key={i} className="grid grid-cols-3 gap-2">
              <input className={inputCls} placeholder="Size" value={v.size} onChange={(e) => updateVariant(i, "size", e.target.value)} />
              <input className={inputCls} placeholder="Color" value={v.color} onChange={(e) => updateVariant(i, "color", e.target.value)} />
              <input type="number" className={inputCls} placeholder="Stock" value={v.stock} onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value) || 0)} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 border-t border-neutral-100 pt-4">
        <button type="submit" disabled={saving} className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50">
          {saving ? "Saving…" : product?.id ? "Save Changes" : "Create Product"}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded-full border border-neutral-200 px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
          Cancel
        </button>
      </div>
    </form>
  )
}

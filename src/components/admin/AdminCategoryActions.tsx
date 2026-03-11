"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Check, X } from "lucide-react"
import { toast } from "sonner"
import type { Category } from "@/generated/prisma/client"

export function AdminCategoryActions({ category }: { category: Category }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(category.name)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/admin/categories/${category.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    setSaving(false)
    if (res.ok) {
      toast.success("Category updated")
      setEditing(false)
      router.refresh()
    } else {
      toast.error("Failed to update")
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete category "${category.name}"?`)) return
    const res = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Deleted"); router.refresh() }
    else toast.error("Failed to delete")
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-neutral-200 px-2.5 py-1 text-sm focus:outline-none"
          autoFocus
        />
        <button onClick={handleSave} disabled={saving} className="rounded-lg p-1.5 hover:bg-green-50">
          <Check className="h-3.5 w-3.5 text-green-600" />
        </button>
        <button onClick={() => setEditing(false)} className="rounded-lg p-1.5 hover:bg-neutral-100">
          <X className="h-3.5 w-3.5 text-neutral-500" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setEditing(true)} className="rounded-lg p-1.5 hover:bg-neutral-100">
        <Pencil className="h-3.5 w-3.5 text-neutral-500" />
      </button>
      <button onClick={handleDelete} className="rounded-lg p-1.5 hover:bg-red-50">
        <Trash2 className="h-3.5 w-3.5 text-red-400" />
      </button>
    </div>
  )
}

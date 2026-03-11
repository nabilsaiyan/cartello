"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(true)
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
    setDeleting(false)
    if (res.ok) {
      toast.success("Product deleted")
      router.refresh()
    } else {
      toast.error("Failed to delete product")
    }
  }

  return (
    <button onClick={handleDelete} disabled={deleting} className="rounded-lg p-1.5 hover:bg-red-50 disabled:opacity-50">
      <Trash2 className="h-3.5 w-3.5 text-red-400" />
    </button>
  )
}

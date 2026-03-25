"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useWishlistStore } from "@/store/wishlist-store"

export function WishlistSync() {
  const { data: session } = useSession()
  const setItems = useWishlistStore((s) => s.setItems)

  useEffect(() => {
    if (!session?.user?.id) return
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((products: { id: string }[]) => {
        if (Array.isArray(products)) {
          setItems(products.map((p) => p.id))
        }
      })
      .catch(() => {})
  }, [session?.user?.id, setItems])

  return null
}

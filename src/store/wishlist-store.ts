"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { WishlistState } from "@/types"

interface WishlistStore extends WishlistState {
  _hasHydrated: boolean
  setHasHydrated: (v: boolean) => void
  setItems: (ids: string[]) => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,

      setHasHydrated(v) {
        set({ _hasHydrated: v })
      },

      setItems(ids) {
        set({ items: ids })
      },

      toggle(productId) {
        set((state) => ({
          items: state.items.includes(productId)
            ? state.items.filter((id) => id !== productId)
            : [...state.items, productId],
        }))
      },

      has(productId) {
        return get().items.includes(productId)
      },
    }),
    {
      name: "cartello-wishlist",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

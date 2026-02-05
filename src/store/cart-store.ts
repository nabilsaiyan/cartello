"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartState, LocalCartItem } from "@/types"

interface CartStore extends CartState {
  _hasHydrated: boolean
  setHasHydrated: (v: boolean) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,

      setHasHydrated(v) {
        set({ _hasHydrated: v })
      },

      addItem(item: LocalCartItem) {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, item] }
        })
      },

      removeItem(productId: string, variantId: string | undefined) {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        }))
      },

      updateQuantity(productId: string, variantId: string | undefined, quantity: number) {
        if (quantity <= 0) {
          get().removeItem(productId, variantId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity }
              : i
          ),
        }))
      },

      clearCart() {
        set({ items: [] })
      },
    }),
    {
      name: "cartello-cart",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

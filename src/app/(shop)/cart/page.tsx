"use client"

import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import { formatPrice } from "@/lib/utils"
import { FREE_SHIPPING_THRESHOLD, SHIPPING_RATES } from "@/lib/constants"
import { motion, AnimatePresence } from "framer-motion"

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const hasHydrated = useCartStore((s) => s._hasHydrated)
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const shippingCost = total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATES.standard.price
  const orderTotal = total + shippingCost

  if (!hasHydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
      </div>
    )
  }

  if (itemCount === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <ShoppingBag className="h-16 w-16 text-neutral-200" />
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Your cart is empty</h1>
          <p className="mt-2 text-neutral-500">Add some items to get started</p>
        </div>
        <Link
          href="/products"
          className="mt-2 rounded-full bg-neutral-900 px-8 py-3 text-sm font-semibold text-white hover:bg-neutral-700"
        >
          Shop Now
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-neutral-900">
        Your Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
      </h1>

      <div className="grid gap-12 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          {total < FREE_SHIPPING_THRESHOLD && (
            <div className="mb-6 rounded-2xl bg-neutral-50 p-4">
              <p className="text-sm text-neutral-600">
                Add <strong>{formatPrice(FREE_SHIPPING_THRESHOLD - total)}</strong> more for free shipping
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-neutral-200">
                <div
                  className="h-full rounded-full bg-neutral-900 transition-all"
                  style={{ width: `${Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          <ul className="divide-y divide-neutral-100">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.li
                  key={`${item.productId}-${item.variantId}`}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-5 py-6"
                >
                  <div className="relative h-28 w-22 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="88px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <div>
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-medium text-neutral-900 hover:underline"
                        >
                          {item.name}
                        </Link>
                        {(item.size || item.color) && (
                          <p className="mt-0.5 text-sm text-neutral-500">
                            {[item.size, item.color].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                      <span className="font-semibold text-neutral-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full border border-neutral-300 px-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="text-sm text-neutral-400 hover:text-red-500 flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-neutral-100 bg-neutral-50 p-6">
            <h2 className="mb-5 text-base font-semibold text-neutral-900">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Shipping</span>
                <span className="font-medium">
                  {shippingCost === 0 ? <span className="text-green-600">Free</span> : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="border-t border-neutral-200 pt-3 flex justify-between">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="font-bold text-lg text-neutral-900">{formatPrice(orderTotal)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                href="/checkout"
                className="block w-full rounded-full bg-neutral-900 py-3.5 text-center text-sm font-semibold text-white hover:bg-neutral-700"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/products"
                className="block w-full rounded-full border border-neutral-300 py-3 text-center text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Continue Shopping
              </Link>
            </div>

            <p className="mt-4 text-center text-xs text-neutral-400">
              Secure checkout · SSL encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

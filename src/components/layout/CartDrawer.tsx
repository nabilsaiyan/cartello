"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useCartStore } from "@/store/cart-store"
import { formatPrice } from "@/lib/utils"
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants"

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const shippingProgress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const remaining = FREE_SHIPPING_THRESHOLD - total

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                <span className="font-semibold">
                  Cart {itemCount > 0 && `(${itemCount})`}
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close cart"
                className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag className="h-16 w-16 text-neutral-200" />
                <div>
                  <p className="font-semibold text-neutral-900">Your cart is empty</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Add some items to get started
                  </p>
                </div>
                <Link
                  href="/products"
                  onClick={onClose}
                  className="mt-2 rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
                >
                  Shop Now
                </Link>
              </div>
            ) : (
              <>
                {/* Free shipping progress */}
                {remaining > 0 && (
                  <div className="bg-neutral-50 px-6 py-3">
                    <p className="text-xs text-neutral-600">
                      Add{" "}
                      <span className="font-semibold text-neutral-900">
                        {formatPrice(remaining)}
                      </span>{" "}
                      more for free shipping
                    </p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${shippingProgress}%` }}
                        className="h-full rounded-full bg-neutral-900"
                      />
                    </div>
                  </div>
                )}
                {remaining <= 0 && (
                  <div className="bg-green-50 px-6 py-3">
                    <p className="text-xs font-medium text-green-700">
                      You&apos;ve unlocked free shipping!
                    </p>
                  </div>
                )}

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <ul className="space-y-4">
                    {items.map((item) => (
                      <li key={`${item.productId}-${item.variantId}`} className="flex gap-4">
                        <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between">
                            <div>
                              <Link
                                href={`/products/${item.slug}`}
                                onClick={onClose}
                                className="text-sm font-medium text-neutral-900 hover:underline"
                              >
                                {item.name}
                              </Link>
                              {(item.size || item.color) && (
                                <p className="mt-0.5 text-xs text-neutral-500">
                                  {[item.size, item.color].filter(Boolean).join(" · ")}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => removeItem(item.productId, item.variantId)}
                              className="text-neutral-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-2 rounded-full border border-neutral-200 px-2">
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.variantId, item.quantity - 1)
                                }
                                className="p-1 text-neutral-500 hover:text-neutral-900"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-5 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.variantId, item.quantity + 1)
                                }
                                className="p-1 text-neutral-500 hover:text-neutral-900"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="text-sm font-semibold text-neutral-900">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer */}
                <div className="border-t border-neutral-100 px-6 py-6 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Subtotal</span>
                    <span className="font-semibold text-neutral-900">{formatPrice(total)}</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Shipping calculated at checkout
                  </p>
                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className="block w-full rounded-full bg-neutral-900 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
                  >
                    Checkout · {formatPrice(total)}
                  </Link>
                  <Link
                    href="/cart"
                    onClick={onClose}
                    className="block w-full rounded-full border border-neutral-200 py-3 text-center text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                  >
                    View Cart
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

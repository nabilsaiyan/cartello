"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingBag } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/Badge"
import { StarRating } from "@/components/ui/StarRating"
import { Spinner } from "@/components/ui/Spinner"
import { useCartStore } from "@/store/cart-store"
import { useWishlistStore } from "@/store/wishlist-store"
import { formatPrice } from "@/lib/utils"
import type { ProductWithRelations } from "@/types"

interface ProductCardProps {
  product: ProductWithRelations
  priority?: boolean
  index?: number
}

export function ProductCard({ product, priority = false, index = 0 }: ProductCardProps) {
  const { data: session } = useSession()
  const addItem = useCartStore((s) => s.addItem)
  const toggle = useWishlistStore((s) => s.toggle)
  const wishlistItems = useWishlistStore((s) => s.items)
  const wishlistHydrated = useWishlistStore((s) => s._hasHydrated)
  const wishlisted = wishlistHydrated && wishlistItems.includes(product.id)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  async function handleWishlistToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    toggle(product.id)
    if (session?.user?.id) {
      setWishlistLoading(true)
      try {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        })
      } finally {
        setWishlistLoading(false)
      }
    }
  }

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0

  const isNew =
    Date.now() - new Date(product.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
  const isSale = product.comparePrice && product.comparePrice > product.price

  const defaultVariant = product.variants[0]

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: `${product.id}-${defaultVariant?.id ?? "default"}`,
      productId: product.id,
      variantId: defaultVariant?.id,
      name: product.name,
      price: defaultVariant?.price ?? product.price,
      image: product.images[0],
      quantity: 1,
      size: defaultVariant?.size ?? undefined,
      color: defaultVariant?.color ?? undefined,
      colorHex: defaultVariant?.colorHex ?? undefined,
      slug: product.slug,
    })
    toast.success(`${product.name} added to cart`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
    <Link href={`/products/${product.slug}`} className="group relative block">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100 border border-neutral-200">
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        )}
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
          {isNew && <Badge variant="new" />}
          {isSale && (
            <Badge variant="sale">
              −{Math.round((1 - product.price / product.comparePrice!) * 100)}%
            </Badge>
          )}
          {defaultVariant && defaultVariant.stock === 0 && (
            <Badge variant="sold-out">Sold out</Badge>
          )}
        </div>

        {/* Actions overlay */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={handleQuickAdd}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white/95 py-2.5 text-xs font-semibold text-neutral-900 shadow backdrop-blur-sm transition-colors hover:bg-neutral-900 hover:text-white"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Quick Add
          </button>
          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow backdrop-blur-sm transition-colors hover:bg-neutral-900 hover:text-white disabled:opacity-60"
          >
            {wishlistLoading
              ? <Spinner className="h-3.5 w-3.5" />
              : <Heart className={`h-4 w-4 transition-colors ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
            }
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1">
        <p className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">{product.category.name}</p>
        <h3 className="text-sm font-medium text-neutral-900 line-clamp-1 transition-opacity group-hover:opacity-60">
          {product.name}
        </h3>
        {avgRating > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRating rating={avgRating} size="sm" />
            <span className="text-xs text-neutral-400">({product.reviews.length})</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${isSale ? "text-[#c8a96e]" : "text-neutral-900"}`}>
            {formatPrice(product.price)}
          </span>
          {isSale && (
            <>
              <span className="text-xs text-neutral-400 line-through">{formatPrice(product.comparePrice!)}</span>
              <span className="text-[10px] font-medium text-[#c8a96e]">
                −{Math.round((1 - product.price / product.comparePrice!) * 100)}%
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
    </motion.div>
  )
}

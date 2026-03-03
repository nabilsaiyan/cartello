"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Heart, ShoppingBag, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { useCartStore } from "@/store/cart-store"
import { useWishlistStore } from "@/store/wishlist-store"
import { VariantSelector } from "@/components/product/VariantSelector"
import { ProductGallery } from "@/components/product/ProductGallery"
import { StarRating } from "@/components/ui/StarRating"
import { ProductCard } from "@/components/product/ProductCard"
import { Badge } from "@/components/ui/Badge"
import { Skeleton } from "@/components/ui/Skeleton"
import { formatPrice } from "@/lib/utils"
import type { ProductWithRelations } from "@/types"
import type { Variant } from "@/generated/prisma/client"

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<ProductWithRelations | null>(null)
  const [related, setRelated] = useState<ProductWithRelations[]>([])
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [openAccordion, setOpenAccordion] = useState<string | null>("description")
  const [reviewText, setReviewText] = useState("")
  const [reviewRating, setReviewRating] = useState(5)
  const [submittingReview, setSubmittingReview] = useState(false)

  const addItem = useCartStore((s) => s.addItem)
  const toggle = useWishlistStore((s) => s.toggle)
  const has = useWishlistStore((s) => s.has)
  const wishlistHydrated = useWishlistStore((s) => s._hasHydrated)

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((p) => {
        setProduct(p)
        setSelectedVariant(p.variants?.[0] ?? null)
        setLoading(false)
        if (p.categoryId) {
          fetch(`/api/products?category=${p.category?.slug}&limit=4`)
            .then((r) => r.json())
            .then((d) => setRelated(d.products?.filter((r: ProductWithRelations) => r.id !== p.id).slice(0, 4) ?? []))
        }
      })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) return <ProductDetailSkeleton />
  if (!product) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <p className="text-lg font-medium">Product not found</p>
      <Link href="/products" className="mt-4 text-sm underline">Back to products</Link>
    </div>
  )

  const wishlisted = wishlistHydrated && has(product.id)
  const price = selectedVariant?.price ?? product.price
  const isSale = product.comparePrice && product.comparePrice > product.price
  const inStock = selectedVariant ? selectedVariant.stock > 0 : true
  const avgRating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 0

  function handleAddToCart() {
    if (!inStock) return
    addItem({
      id: `${product!.id}-${selectedVariant?.id ?? "default"}`,
      productId: product!.id,
      variantId: selectedVariant?.id,
      name: product!.name,
      price,
      image: product!.images[0],
      quantity,
      size: selectedVariant?.size ?? undefined,
      color: selectedVariant?.color ?? undefined,
      colorHex: selectedVariant?.colorHex ?? undefined,
      slug: product!.slug,
    })
    toast.success("Added to cart")
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault()
    setSubmittingReview(true)
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product!.id, rating: reviewRating, body: reviewText }),
    })
    setSubmittingReview(false)
    if (res.ok) {
      toast.success("Review submitted!")
      setReviewText("")
      const updated = await fetch(`/api/products/${slug}`).then(r => r.json())
      setProduct(updated)
    } else {
      const d = await res.json()
      toast.error(d.error ?? "Failed to submit review")
    }
  }

  const accordions = [
    { id: "description", title: "Description", content: product.description },
    { id: "shipping", title: "Shipping & Returns", content: "Free standard shipping on orders over €50. Express shipping available. Returns accepted within 30 days of delivery. Items must be unworn and in original condition with tags attached." },
    { id: "care", title: "Care Instructions", content: "Please refer to the care label on your garment. Generally, we recommend gentle machine wash or hand wash in cold water with like colours. Lay flat to dry." },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-neutral-400">
        <Link href="/" className="hover:text-neutral-700">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-neutral-700">Products</Link>
        <span>/</span>
        <Link href={`/category/${product.category.slug}`} className="hover:text-neutral-700">{product.category.name}</Link>
        <span>/</span>
        <span className="text-neutral-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Gallery */}
        <ProductGallery images={product.images} name={product.name} />

        {/* Info */}
        <div className="flex flex-col">
          <div>
            <Link href={`/category/${product.category.slug}`} className="text-xs font-semibold uppercase tracking-widest text-neutral-400 hover:text-neutral-700">
              {product.category.name}
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-neutral-900">{product.name}</h1>

            {avgRating > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <StarRating rating={avgRating} size="md" />
                <span className="text-sm text-neutral-500">
                  {avgRating.toFixed(1)} ({product.reviews.length} review{product.reviews.length !== 1 ? "s" : ""})
                </span>
              </div>
            )}

            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-bold text-neutral-900">{formatPrice(price)}</span>
              {isSale && (
                <>
                  <span className="text-base text-neutral-400 line-through">{formatPrice(product.comparePrice!)}</span>
                  <Badge variant="sale">
                    -{Math.round((1 - product.price / product.comparePrice!) * 100)}%
                  </Badge>
                </>
              )}
            </div>

            {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
              <p className="mt-2 text-sm font-medium text-amber-600">
                Only {selectedVariant.stock} left in stock
              </p>
            )}
          </div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="mt-6">
              <VariantSelector
                variants={product.variants}
                selectedId={selectedVariant?.id ?? null}
                onSelect={setSelectedVariant}
              />
            </div>
          )}

          {/* Quantity + Add to cart */}
          <div className="mt-6 flex gap-3">
            <div className="flex items-center gap-1 rounded-full border border-neutral-200 px-3">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-neutral-500 hover:text-neutral-900">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-2 text-neutral-500 hover:text-neutral-900">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-neutral-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 disabled:bg-neutral-300"
            >
              <ShoppingBag className="h-4 w-4" />
              {inStock ? "Add to Cart" : "Sold Out"}
            </button>
            <button
              onClick={() => toggle(product.id)}
              className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${wishlisted ? "border-red-200 bg-red-50 text-red-500" : "border-neutral-200 hover:border-neutral-400"}`}
            >
              <Heart className={`h-5 w-5 ${wishlisted ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* Accordions */}
          <div className="mt-8 divide-y divide-neutral-100 border-t border-neutral-100">
            {accordions.map((a) => (
              <div key={a.id}>
                <button
                  onClick={() => setOpenAccordion(openAccordion === a.id ? null : a.id)}
                  className="flex w-full items-center justify-between py-4 text-sm font-medium text-neutral-900"
                >
                  {a.title}
                  <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${openAccordion === a.id ? "rotate-180" : ""}`} />
                </button>
                {openAccordion === a.id && (
                  <p className="pb-4 text-sm leading-relaxed text-neutral-600">{a.content}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-20 border-t border-neutral-100 pt-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Customer Reviews</h2>
            {avgRating > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <StarRating rating={avgRating} size="lg" />
                <span className="text-sm text-neutral-500">{avgRating.toFixed(1)} average · {product.reviews.length} reviews</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Review list */}
          <div className="space-y-6">
            {product.reviews.length === 0 ? (
              <p className="text-neutral-500">No reviews yet. Be the first!</p>
            ) : (
              product.reviews.map((r) => (
                <div key={r.id} className="border-b border-neutral-100 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium">
                      {(r as any).user?.name?.[0]?.toUpperCase() ?? "A"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{(r as any).user?.name ?? "Anonymous"}</p>
                      <p className="text-xs text-neutral-400">{new Date(r.createdAt).toLocaleDateString("en-IE", { year: "numeric", month: "long", day: "numeric" })}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <StarRating rating={r.rating} size="sm" />
                    {r.title && <p className="mt-1.5 text-sm font-medium text-neutral-900">{r.title}</p>}
                    {r.body && <p className="mt-1 text-sm text-neutral-600">{r.body}</p>}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Write review */}
          <div>
            <h3 className="mb-4 text-base font-semibold text-neutral-900">Write a Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Rating</label>
                <StarRating rating={reviewRating} size="lg" interactive onRate={setReviewRating} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Your review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                  placeholder="Share your experience…"
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
              >
                {submittingReview ? "Submitting…" : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-20 border-t border-neutral-100 pt-12">
          <h2 className="mb-8 text-xl font-bold text-neutral-900">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <Skeleton className="aspect-[4/5] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  )
}

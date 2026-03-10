import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/product/ProductCard"
import type { ProductWithRelations } from "@/types"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "My Wishlist" }

export default async function WishlistPage() {
  const session = await auth()
  const wishlist = await prisma.wishlist.findMany({
    where: { userId: session!.user.id },
    include: { product: { include: { category: true, variants: true, reviews: true } } },
    orderBy: { createdAt: "desc" },
  })
  const products = wishlist.map((w) => w.product) as ProductWithRelations[]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">My Wishlist</h1>
      {products.length === 0 ? (
        <div className="rounded-2xl border border-neutral-100 py-16 text-center">
          <p className="text-neutral-500">Your wishlist is empty</p>
          <a href="/products" className="mt-3 inline-block text-sm font-medium text-neutral-900 underline">
            Browse products
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}

import Link from "next/link"
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
          <p className="mt-1 text-sm text-neutral-400">Save items you love and find them here</p>
          <Link
            href="/products"
            className="mt-5 inline-block rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </div>
  )
}

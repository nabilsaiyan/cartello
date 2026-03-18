import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/product/ProductCard"
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants"
import type { ProductWithRelations } from "@/types"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cartello — Premium Menswear",
  description: "Discover premium menswear crafted for those who appreciate quality and style. Free shipping on orders over €" + FREE_SHIPPING_THRESHOLD + ".",
}

export const revalidate = 3600

async function getFeaturedProducts(): Promise<ProductWithRelations[]> {
  try {
    return await prisma.product.findMany({
      where: { published: true, featured: true },
      include: { category: true, variants: true, reviews: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    })
  } catch {
    return []
  }
}

async function getNewArrivals(): Promise<ProductWithRelations[]> {
  try {
    return await prisma.product.findMany({
      where: { published: true },
      include: { category: true, variants: true, reviews: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    })
  } catch {
    return []
  }
}

const categories = [
  { name: "Women", slug: "women", bg: "bg-stone-100", label: "Shop Women →" },
  { name: "Men", slug: "men", bg: "bg-slate-100", label: "Shop Men →" },
  { name: "Accessories", slug: "accessories", bg: "bg-amber-50", label: "Shop Accessories →" },
  { name: "New Arrivals", slug: "new-arrivals", bg: "bg-rose-50", label: "New In →" },
]

const marqueeItems = [
  `Free shipping over €${FREE_SHIPPING_THRESHOLD}`,
  "New arrivals every week",
  "30-day hassle-free returns",
  "Sustainable packaging",
  "Premium quality guaranteed",
]

export default async function HomePage() {
  const [featured, newArrivals] = await Promise.all([getFeaturedProducts(), getNewArrivals()])

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden bg-neutral-950">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black" />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #c8a96e33 0%, transparent 50%), radial-gradient(circle at 80% 20%, #ffffff11 0%, transparent 40%)" }}
        />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-400">
            New Collection · Summer 2025
          </p>
          <h1 className="text-6xl font-bold leading-[1.05] tracking-tight text-white sm:text-8xl">
            Wear What
            <br />
            <em className="not-italic text-neutral-300">You Love</em>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-neutral-400">
            Curated premium fashion for those who appreciate quality,
            style, and conscious craftsmanship.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-neutral-900 transition-all hover:bg-neutral-100 hover:gap-3"
            >
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/category/new-arrivals"
              className="rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/10"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-y border-neutral-100 bg-neutral-50 py-3">
        <div className="flex animate-[marquee_25s_linear_infinite] whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="mx-8 text-xs font-medium uppercase tracking-widest text-neutral-400">
              {item} <span className="mx-6 text-neutral-300">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Browse</p>
            <h2 className="mt-1 text-2xl font-bold text-neutral-900">Shop by Category</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className={`${cat.bg} group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl p-5 transition-transform hover:-translate-y-1`}
            >
              <div>
                <p className="font-semibold text-neutral-900">{cat.name}</p>
                <p className="mt-0.5 text-xs text-neutral-500 transition-all group-hover:text-neutral-700">
                  {cat.label}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Handpicked</p>
              <h2 className="mt-1 text-2xl font-bold text-neutral-900">Featured Pieces</h2>
            </div>
            <Link href="/products" className="text-sm font-medium text-neutral-500 hover:text-neutral-900">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 4} />
            ))}
          </div>
        </section>
      )}

      {/* Promo Banner */}
      <section className="mx-4 mb-20 overflow-hidden rounded-3xl bg-neutral-900 sm:mx-6 lg:mx-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-8 py-16 text-center md:flex-row md:text-left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Limited time</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Up to 30% off sale items</h2>
            <p className="mt-2 text-neutral-400">New markdowns added. While stocks last.</p>
          </div>
          <Link
            href="/products?sort=price_asc"
            className="flex-shrink-0 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
          >
            Shop Sale
          </Link>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Just dropped</p>
              <h2 className="mt-1 text-2xl font-bold text-neutral-900">New Arrivals</h2>
            </div>
            <Link href="/category/new-arrivals" className="text-sm font-medium text-neutral-500 hover:text-neutral-900">
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Trust strip */}
      <section className="border-t border-neutral-100 bg-neutral-50 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { title: "Free Shipping", desc: "On orders over €50" },
            { title: "30-Day Returns", desc: "Hassle-free guarantee" },
            { title: "Secure Payment", desc: "Encrypted checkout" },
            { title: "Premium Quality", desc: "Curated craftsmanship" },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <p className="font-semibold text-neutral-900">{item.title}</p>
              <p className="mt-1 text-sm text-neutral-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Truck, RotateCcw, ShieldCheck, Gem } from "lucide-react"
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
  { name: "Men", slug: "men", image: "/cat-men.png", label: "Shop Men" },
  { name: "Outerwear", slug: "outerwear", image: "/cat-outerwear.png", label: "Shop Outerwear" },
  { name: "Accessories", slug: "accessories", image: "/cat-accessories.png", label: "Shop Accessories" },
  { name: "New Arrivals", slug: "new-arrivals", image: "/cat-new-arrivals.png", label: "New In" },
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
      <section className="relative flex items-center overflow-hidden bg-neutral-950" style={{ height: "calc(100vh - var(--navbar-h) - var(--marquee-h))" }}>
        {/* Background image */}
        <Image
          src="/hero.png"
          alt=""
          fill
          className="object-cover object-right"
          priority
          quality={90}
        />
        {/* Gradient overlay — dark left for text, fades right to reveal the figure */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/10" />

        {/* Content */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            {/* Collection label */}
            <div className="mb-10 flex items-center gap-4">
              <span className="h-px w-10 bg-[#c8a96e]" />
              <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#c8a96e]">
                New Collection · SS 2025
              </span>
            </div>

            {/* Heading */}
            <h1 className="font-display text-[clamp(4rem,10vw,9rem)] font-light leading-[0.92] text-white">
              Wear<br />
              What<br />
              <em className="italic text-neutral-400">You Love</em>
            </h1>

            {/* Body */}
            <p className="mt-10 max-w-sm text-base leading-relaxed text-neutral-500">
              Curated premium menswear for those who appreciate quality, style, and conscious craftsmanship.
            </p>

            {/* CTAs */}
            <div className="mt-12 flex items-center gap-8">
              <Link
                href="/products"
                className="flex items-center gap-2.5 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-neutral-900 transition-all hover:bg-neutral-100 hover:gap-3.5"
              >
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/category/new-arrivals"
                className="flex items-center gap-2 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
              >
                New Arrivals <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Bottom scroll hint */}
          <div className="absolute bottom-10 right-8 hidden flex-col items-center gap-2 sm:flex">
            <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-600">Scroll</span>
            <span className="h-8 w-px bg-gradient-to-b from-neutral-600 to-transparent" />
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-y border-neutral-100 bg-[#faf8f5] py-3.5">
        <div
          className="flex w-max animate-[marquee_25s_linear_infinite]"
          style={{ willChange: "transform" }}
        >
          {Array.from({ length: 4 }, () => marqueeItems).flat().map((item, i) => (
            <span key={i} className="mx-10 flex-shrink-0 text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-500">
              {item} <span className="mx-4 text-[#c8a96e]">·</span>
            </span>
          ))}
        </div>
      </div>

      {false && <div>
        <p className="mb-1 font-display text-2xl font-light text-neutral-900">New tag</p>
        <p className="mb-10 text-[11px] uppercase tracking-widest text-neutral-400">6 creative concepts — dark + light background</p>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">

          {/* N1 — Physical hangtag: looks like a real clothing tag */}
          <div className="flex flex-col gap-3">
            <div className="relative flex h-36 items-start justify-start overflow-hidden rounded-xl bg-neutral-700 p-4">
              <span className="flex flex-col items-center gap-1 -rotate-3 rounded border border-neutral-300 bg-[#faf7f2] px-3 py-2 shadow-md">
                <span className="h-2 w-2 rounded-full border border-neutral-400 bg-transparent" />
                <span className="h-px w-full bg-neutral-200" />
                <span className="font-display text-[13px] italic font-light text-neutral-600 leading-none tracking-wide">New In</span>
              </span>
            </div>
            <div className="relative flex h-36 items-start justify-start overflow-hidden rounded-xl bg-neutral-100 p-4">
              <span className="flex flex-col items-center gap-1 -rotate-3 rounded border border-neutral-300 bg-[#faf7f2] px-3 py-2 shadow-md">
                <span className="h-2 w-2 rounded-full border border-neutral-400 bg-transparent" />
                <span className="h-px w-full bg-neutral-200" />
                <span className="font-display text-[13px] italic font-light text-neutral-600 leading-none tracking-wide">New In</span>
              </span>
            </div>
            <span className="text-[10px] font-medium text-neutral-700">N1 · Hangtag</span>
            <span className="text-[9px] text-neutral-400 -mt-2">Like a real clothing label</span>
          </div>

          {/* N2 — Circle seal / gold stamp */}
          <div className="flex flex-col gap-3">
            <div className="relative flex h-36 items-start justify-start overflow-hidden rounded-xl bg-neutral-700 p-4">
              <span className="flex h-14 w-14 flex-col items-center justify-center rounded-full border-2 border-[#c8a96e] bg-white shadow-sm">
                <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#c8a96e] leading-none">New</span>
                <span className="my-0.5 h-px w-6 bg-[#c8a96e]/40" />
                <span className="text-[7px] font-medium uppercase tracking-[0.2em] text-neutral-400 leading-none">In</span>
              </span>
            </div>
            <div className="relative flex h-36 items-start justify-start overflow-hidden rounded-xl bg-neutral-100 p-4">
              <span className="flex h-14 w-14 flex-col items-center justify-center rounded-full border-2 border-[#c8a96e] bg-white shadow-sm">
                <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#c8a96e] leading-none">New</span>
                <span className="my-0.5 h-px w-6 bg-[#c8a96e]/40" />
                <span className="text-[7px] font-medium uppercase tracking-[0.2em] text-neutral-400 leading-none">In</span>
              </span>
            </div>
            <span className="text-[10px] font-medium text-neutral-700">N2 · Gold seal</span>
            <span className="text-[9px] text-neutral-400 -mt-2">Circular stamp, always white bg</span>
          </div>

          {/* N3 — Editorial watermark: huge faded text across whole image */}
          <div className="flex flex-col gap-3">
            <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-xl bg-neutral-700">
              <span className="select-none font-display text-[56px] font-light italic text-white/15 uppercase leading-none">New</span>
              <span className="absolute bottom-3 left-3 bg-neutral-900/60 px-2 py-0.5 text-[8px] uppercase tracking-widest text-white/60 backdrop-blur-sm">preview</span>
            </div>
            <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-xl bg-neutral-200">
              <span className="select-none font-display text-[56px] font-light italic text-neutral-900/10 uppercase leading-none">New</span>
            </div>
            <span className="text-[10px] font-medium text-neutral-700">N3 · Watermark</span>
            <span className="text-[9px] text-neutral-400 -mt-2">Big editorial text on image</span>
          </div>

          {/* N4 — Brushstroke highlight behind serif text */}
          <div className="flex flex-col gap-3">
            <div className="relative flex h-36 items-start justify-start overflow-hidden rounded-xl bg-neutral-700 p-4">
              <span className="relative inline-flex items-center px-2 py-0.5">
                <span className="absolute inset-0 -skew-x-6 bg-[#c8a96e]/30 rounded-sm" />
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#c8a96e]/60" />
                <span className="relative font-display text-[15px] italic font-light text-white tracking-wide">New In</span>
              </span>
            </div>
            <div className="relative flex h-36 items-start justify-start overflow-hidden rounded-xl bg-neutral-100 p-4">
              <span className="relative inline-flex items-center px-2 py-0.5">
                <span className="absolute inset-0 -skew-x-6 bg-[#c8a96e]/25 rounded-sm" />
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#c8a96e]" />
                <span className="relative font-display text-[15px] italic font-light text-neutral-900 tracking-wide">New In</span>
              </span>
            </div>
            <span className="text-[10px] font-medium text-neutral-700">N4 · Highlight brush</span>
            <span className="text-[9px] text-neutral-400 -mt-2">Gold brushstroke behind text</span>
          </div>

          {/* N5 — Top-right corner triangle fold */}
          <div className="flex flex-col gap-3">
            <div className="relative h-36 overflow-hidden rounded-xl bg-neutral-700">
              <div className="absolute right-0 top-0 h-0 w-0 border-b-[52px] border-r-[52px] border-b-transparent border-r-[#c8a96e]" />
              <span className="absolute right-[3px] top-[5px] -rotate-45 text-[7px] font-bold uppercase tracking-tight text-neutral-950">New</span>
            </div>
            <div className="relative h-36 overflow-hidden rounded-xl bg-neutral-100">
              <div className="absolute right-0 top-0 h-0 w-0 border-b-[52px] border-r-[52px] border-b-transparent border-r-[#c8a96e]" />
              <span className="absolute right-[3px] top-[5px] -rotate-45 text-[7px] font-bold uppercase tracking-tight text-neutral-950">New</span>
            </div>
            <span className="text-[10px] font-medium text-neutral-700">N5 · Corner fold</span>
            <span className="text-[9px] text-neutral-400 -mt-2">Folded corner in gold</span>
          </div>

          {/* N6 — Postage stamp: dashed border frame */}
          <div className="flex flex-col gap-3">
            <div className="relative flex h-36 items-start justify-start overflow-hidden rounded-xl bg-neutral-700 p-4">
              <span className="flex flex-col items-center justify-center border-2 border-dashed border-[#c8a96e] bg-white px-3 py-2">
                <span className="font-display text-[13px] italic font-light text-[#c8a96e] leading-none">New</span>
                <span className="mt-0.5 text-[7px] font-medium uppercase tracking-[0.2em] text-neutral-400 leading-none">In</span>
              </span>
            </div>
            <div className="relative flex h-36 items-start justify-start overflow-hidden rounded-xl bg-neutral-100 p-4">
              <span className="flex flex-col items-center justify-center border-2 border-dashed border-[#c8a96e] bg-white px-3 py-2">
                <span className="font-display text-[13px] italic font-light text-[#c8a96e] leading-none">New</span>
                <span className="mt-0.5 text-[7px] font-medium uppercase tracking-[0.2em] text-neutral-400 leading-none">In</span>
              </span>
            </div>
            <span className="text-[10px] font-medium text-neutral-700">N6 · Stamp</span>
            <span className="text-[9px] text-neutral-400 -mt-2">Dashed frame like a postage stamp</span>
          </div>
        </div>

        {/* SALE */}
        <p className="mb-1 mt-16 font-display text-2xl font-light text-neutral-900">Sale / promo tag</p>
        <p className="mb-10 text-[11px] uppercase tracking-widest text-neutral-400">4 creative concepts</p>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">

          {/* S1 — Diamond price tag (rotated square) */}
          <div className="flex flex-col gap-3">
            <div className="relative flex h-36 items-start justify-start overflow-hidden rounded-xl bg-neutral-700 p-4">
              <span className="relative flex h-14 w-14 items-center justify-center bg-[#c8a96e] rotate-45 shadow-md">
                <span className="-rotate-45 flex flex-col items-center leading-none">
                  <span className="font-display text-[11px] italic font-semibold text-neutral-950 leading-none">−20%</span>
                  <span className="text-[6px] uppercase tracking-wider text-neutral-700 leading-none mt-0.5">off</span>
                </span>
              </span>
            </div>
            <div className="relative flex h-36 items-start justify-start overflow-hidden rounded-xl bg-neutral-100 p-4">
              <span className="relative flex h-14 w-14 items-center justify-center bg-[#c8a96e] rotate-45 shadow-md">
                <span className="-rotate-45 flex flex-col items-center leading-none">
                  <span className="font-display text-[11px] italic font-semibold text-neutral-950 leading-none">−20%</span>
                  <span className="text-[6px] uppercase tracking-wider text-neutral-700 leading-none mt-0.5">off</span>
                </span>
              </span>
            </div>
            <span className="text-[10px] font-medium text-neutral-700">S1 · Diamond tag</span>
            <span className="text-[9px] text-neutral-400 -mt-2">Rotated square, classic price tag</span>
          </div>

          {/* S2 — Circular seal matching N2 */}
          <div className="flex flex-col gap-3">
            <div className="relative flex h-36 items-start justify-start overflow-hidden rounded-xl bg-neutral-700 p-4">
              <span className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-[#c8a96e] shadow-sm">
                <span className="font-display text-[14px] italic font-light text-neutral-950 leading-none">−20</span>
                <span className="text-[6px] font-bold uppercase tracking-wider text-neutral-800 leading-none mt-0.5">% off</span>
              </span>
            </div>
            <div className="relative flex h-36 items-start justify-start overflow-hidden rounded-xl bg-neutral-100 p-4">
              <span className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-[#c8a96e] shadow-sm">
                <span className="font-display text-[14px] italic font-light text-neutral-950 leading-none">−20</span>
                <span className="text-[6px] font-bold uppercase tracking-wider text-neutral-800 leading-none mt-0.5">% off</span>
              </span>
            </div>
            <span className="text-[10px] font-medium text-neutral-700">S2 · Gold circle</span>
            <span className="text-[9px] text-neutral-400 -mt-2">Pairs with N2 seal style</span>
          </div>

          {/* S3 — Big editorial number: oversized serif */}
          <div className="flex flex-col gap-3">
            <div className="relative flex h-36 items-start justify-start overflow-hidden rounded-xl bg-neutral-700 p-4">
              <span className="flex flex-col bg-white px-3 pb-2 pt-1.5 shadow-sm leading-none">
                <span className="font-display text-3xl italic font-light text-neutral-900 leading-none">20</span>
                <span className="flex items-center gap-1 mt-0.5">
                  <span className="h-px flex-1 bg-[#c8a96e]" />
                  <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#c8a96e]">% off</span>
                </span>
              </span>
            </div>
            <div className="relative flex h-36 items-start justify-start overflow-hidden rounded-xl bg-neutral-100 p-4">
              <span className="flex flex-col bg-white px-3 pb-2 pt-1.5 shadow-sm leading-none">
                <span className="font-display text-3xl italic font-light text-neutral-900 leading-none">20</span>
                <span className="flex items-center gap-1 mt-0.5">
                  <span className="h-px flex-1 bg-[#c8a96e]" />
                  <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#c8a96e]">% off</span>
                </span>
              </span>
            </div>
            <span className="text-[10px] font-medium text-neutral-700">S3 · Editorial number</span>
            <span className="text-[9px] text-neutral-400 -mt-2">Big Cormorant + gold rule</span>
          </div>

          {/* S4 — Postage stamp matching N6 */}
          <div className="flex flex-col gap-3">
            <div className="relative flex h-36 items-start justify-start overflow-hidden rounded-xl bg-neutral-700 p-4">
              <span className="flex flex-col items-center justify-center border-2 border-dashed border-[#c8a96e] bg-white px-3 py-2">
                <span className="font-display text-[17px] italic font-light text-[#c8a96e] leading-none">−20%</span>
                <span className="mt-0.5 text-[7px] font-medium uppercase tracking-[0.2em] text-neutral-400 leading-none">Sale</span>
              </span>
            </div>
            <div className="relative flex h-36 items-start justify-start overflow-hidden rounded-xl bg-neutral-100 p-4">
              <span className="flex flex-col items-center justify-center border-2 border-dashed border-[#c8a96e] bg-white px-3 py-2">
                <span className="font-display text-[17px] italic font-light text-[#c8a96e] leading-none">−20%</span>
                <span className="mt-0.5 text-[7px] font-medium uppercase tracking-[0.2em] text-neutral-400 leading-none">Sale</span>
              </span>
            </div>
            <span className="text-[10px] font-medium text-neutral-700">S4 · Stamp frame</span>
            <span className="text-[9px] text-neutral-400 -mt-2">Pairs with N6 stamp style</span>
          </div>
        </div>
      </div>}

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Browse</p>
            <h2 className="mt-1 font-display text-3xl font-light text-neutral-900">Shop by Category</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {/* Gradient overlay — dark at bottom for text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="relative z-10 p-5">
                <p className="font-semibold text-white">{cat.name}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/60 transition-all group-hover:gap-2.5 group-hover:text-white/90">
                  {cat.label} <ArrowRight className="h-3 w-3" />
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
              <h2 className="mt-1 font-display text-3xl font-light text-neutral-900">Featured Pieces</h2>
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
            <h2 className="mt-2 font-display text-4xl font-light text-white">Up to 30% off sale items</h2>
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
              <h2 className="mt-1 font-display text-3xl font-light text-neutral-900">New Arrivals</h2>
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
            { icon: Truck,        title: "Free Shipping",   desc: "On orders over €50" },
            { icon: RotateCcw,    title: "30-Day Returns",  desc: "Hassle-free guarantee" },
            { icon: ShieldCheck,  title: "Secure Payment",  desc: "Encrypted checkout" },
            { icon: Gem,          title: "Premium Quality", desc: "Curated craftsmanship" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
                <Icon className="h-5 w-5 text-neutral-600" strokeWidth={1.5} />
              </span>
              <div>
                <p className="font-semibold text-neutral-900">{title}</p>
                <p className="mt-0.5 text-sm text-neutral-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

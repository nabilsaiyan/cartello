import type { Metadata } from "next"
import { ProductDetailClient } from "./_ProductDetailClient"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/${slug}`, { next: { revalidate: 3600 } })
    if (!res.ok) return { title: "Product not found — Cartello" }
    const product = await res.json()
    return {
      title: `${product.name} — Cartello`,
      description: product.description?.slice(0, 155),
      openGraph: {
        title: product.name,
        description: product.description?.slice(0, 155),
        images: product.images?.[0] ? [{ url: product.images[0] }] : [],
      },
    }
  } catch {
    return { title: "Cartello" }
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  return <ProductDetailClient slug={slug} />
}

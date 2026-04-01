import type { Metadata } from "next"
import { Cormorant_Garamond, Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Cartello — Premium Menswear",
    template: "%s — Cartello",
  },
  description: "Premium menswear for those who appreciate quality and style. Shop outerwear, essentials, and accessories with free shipping over €50.",
  keywords: ["menswear", "men's fashion", "premium clothing", "outerwear", "accessories", "luxury fashion"],
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Cartello",
    title: "Cartello — Premium Menswear",
    description: "Premium menswear for those who appreciate quality and style.",
  },
  twitter: { card: "summary_large_image" },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

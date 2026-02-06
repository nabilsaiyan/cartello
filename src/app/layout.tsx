import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Cartello — Premium Fashion & Lifestyle",
    template: "%s | Cartello",
  },
  description:
    "Discover premium fashion and lifestyle products. Free shipping over €50.",
  keywords: ["fashion", "lifestyle", "clothing", "premium", "accessories"],
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Cartello",
    title: "Cartello — Premium Fashion & Lifestyle",
    description: "Discover premium fashion and lifestyle products.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

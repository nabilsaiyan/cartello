import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Page Not Found" }

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <p className="font-display text-[8rem] font-light leading-none text-neutral-100 select-none">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-neutral-900">Page not found</h1>
        <p className="mt-2 text-sm text-neutral-500 max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/"
            className="inline-block rounded-full bg-neutral-900 px-8 py-3 text-sm font-semibold text-white hover:bg-neutral-700"
          >
            Back to home
          </Link>
          <Link
            href="/products"
            className="inline-block rounded-full border border-neutral-300 px-8 py-3 text-sm font-medium hover:bg-neutral-50"
          >
            Browse products
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}

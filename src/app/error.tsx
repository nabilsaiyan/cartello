"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold text-neutral-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-neutral-500 max-w-sm">
        An unexpected error occurred. Please try again or return to the homepage.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium hover:bg-neutral-50"
        >
          Go home
        </Link>
      </div>
    </main>
  )
}

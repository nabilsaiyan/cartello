"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Search, X, ArrowRight, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatPrice } from "@/lib/utils"

interface SearchProduct {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  category: { name: string }
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

interface Props {
  open: boolean
  onClose: () => void
}

export function SearchModal({ open, onClose }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debouncedQuery = useDebounce(query, 250)

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery("")
      setResults([])
      setActiveIndex(-1)
    }
  }, [open])

  // Fetch results
  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); setSearchError(false); return }
    setLoading(true)
    setSearchError(false)
    fetch(`/api/products?q=${encodeURIComponent(debouncedQuery)}&limit=6`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then((data) => setResults(data.products ?? []))
      .catch(() => { setResults([]); setSearchError(true) })
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && results[activeIndex]) {
        navigateTo(`/products/${results[activeIndex].slug}`)
      } else if (query.trim()) {
        navigateTo(`/products?q=${encodeURIComponent(query.trim())}`)
      }
    }
  }

  function navigateTo(url: string) {
    onClose()
    router.push(url)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed left-1/2 top-[10vh] z-50 w-full max-w-xl -translate-x-1/2 px-4"
          >
            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
              {/* Input */}
              <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3.5">
                <Search className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search products…"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1) }}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-sm text-neutral-900 placeholder-neutral-400 outline-none"
                />
                {loading && <Loader2 className="h-4 w-4 animate-spin text-neutral-300" />}
                {query && !loading && (
                  <button onClick={() => setQuery("")} className="text-neutral-400 hover:text-neutral-700">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Results */}
              {results.length > 0 && (
                <ul className="max-h-80 overflow-y-auto py-2">
                  {results.map((p, i) => (
                    <li key={p.id}>
                      <button
                        onClick={() => navigateTo(`/products/${p.slug}`)}
                        onMouseEnter={() => setActiveIndex(i)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${i === activeIndex ? "bg-neutral-50" : "hover:bg-neutral-50"}`}
                      >
                        <div className="relative h-12 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                          {p.images[0] && (
                            <Image src={p.images[0]} alt={p.name} fill sizes="40px" className="object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-neutral-900">{p.name}</p>
                          <p className="text-xs text-neutral-400">{p.category.name}</p>
                        </div>
                        <span className="text-sm font-semibold text-neutral-900">{formatPrice(p.price)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Error state */}
              {debouncedQuery && !loading && searchError && (
                <p className="px-4 py-6 text-center text-sm text-neutral-400">Search failed — please try again</p>
              )}

              {/* No results */}
              {debouncedQuery && !loading && !searchError && results.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-neutral-400">No products found for &ldquo;{debouncedQuery}&rdquo;</p>
              )}

              {/* Footer — view all */}
              {query.trim() && results.length > 0 && (
                <div className="border-t border-neutral-100 px-4 py-2.5">
                  <button
                    onClick={() => navigateTo(`/products?q=${encodeURIComponent(query.trim())}`)}
                    className="flex w-full items-center justify-between text-sm text-neutral-500 hover:text-neutral-900"
                  >
                    <span>View all results for &ldquo;{query}&rdquo;</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Empty state hint */}
              {!query && (
                <div className="px-4 py-5 text-center text-xs text-neutral-400">
                  Start typing to search products · Press <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono">↵</kbd> to see all results
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { ShoppingBag, Heart, User, Search, Menu, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useCartStore } from "@/store/cart-store"
import { useWishlistStore } from "@/store/wishlist-store"
import { CartDrawer } from "./CartDrawer"
import { SearchModal } from "./SearchModal"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/products", label: "All Products" },
  { href: "/category/men", label: "Men" },
  { href: "/category/outerwear", label: "Outerwear" },
  { href: "/category/accessories", label: "Accessories" },
  { href: "/category/new-arrivals", label: "New Arrivals" },
]

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const itemCount = useCartStore((s) => s._hasHydrated ? s.items.reduce((sum, i) => sum + i.quantity, 0) : 0)
  const wishlistCount = useWishlistStore((s) => s._hasHydrated ? s.items.length : 0)
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-neutral-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="font-display text-2xl uppercase tracking-[0.2em] text-neutral-900">
            cartello
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-neutral-900",
                  pathname === link.href ? "text-neutral-900" : "text-neutral-500"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button onClick={() => setSearchOpen(true)} className="hidden rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 sm:flex" aria-label="Search">
              <Search className="h-5 w-5" />
            </button>

            <Link href="/account/wishlist" className="relative hidden rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 sm:flex" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* User menu — click-based, not hover */}
            {session ? (
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                >
                  <User className="h-5 w-5" />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-neutral-100 bg-white py-2 shadow-lg"
                    >
                      <Link href="/account" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">My Account</Link>
                      <Link href="/account/orders" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Orders</Link>
                      <Link href="/account/wishlist" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Wishlist</Link>
                      {session.user?.role === "ADMIN" && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Admin</Link>
                      )}
                      <hr className="my-1 border-neutral-100" />
                      <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50">
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/auth/sign-in" className="hidden rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 sm:flex" aria-label="Sign in">
                <User className="h-5 w-5" />
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>

            <button onClick={() => setMobileOpen(true)} className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 md:hidden" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
                <span className="text-lg font-semibold">Menu</span>
                <button onClick={() => setMobileOpen(false)}><X className="h-5 w-5 text-neutral-500" /></button>
              </div>
              <nav className="px-6 py-6 space-y-4">
                {NAV_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block text-base font-medium text-neutral-700 hover:text-neutral-900">
                    {link.label}
                  </Link>
                ))}
                <hr className="border-neutral-100" />
                <button onClick={() => { setMobileOpen(false); setSearchOpen(true) }} className="flex items-center gap-2 text-neutral-600"><Search className="h-4 w-4" /> Search</button>
                <Link href="/account/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-neutral-600">
                  <Heart className="h-4 w-4" /> Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </Link>
                {session ? (
                  <>
                    <Link href="/account" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-neutral-600"><User className="h-4 w-4" /> My Account</Link>
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-2 text-neutral-600">Sign out</button>
                  </>
                ) : (
                  <Link href="/auth/sign-in" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-neutral-600"><User className="h-4 w-4" /> Sign in</Link>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

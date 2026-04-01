import Link from "next/link"
import { NewsletterForm } from "./NewsletterForm"

const footerLinks = {
  Shop: [
    { href: "/products", label: "All Products" },
    { href: "/category/men", label: "Men" },
    { href: "/category/outerwear", label: "Outerwear" },
    { href: "/category/accessories", label: "Accessories" },
    { href: "/category/new-arrivals", label: "New Arrivals" },
  ],
  Help: [
    { href: "/faq", label: "FAQ" },
    { href: "/shipping", label: "Shipping & Returns" },
    { href: "/size-guide", label: "Size Guide" },
    { href: "/contact", label: "Contact Us" },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/careers", label: "Careers" },
    { href: "/sustainability", label: "Sustainability" },
    { href: "/press", label: "Press" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-neutral-100 bg-white">
      {/* Newsletter */}
      <div className="bg-neutral-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
            <div>
              <h3 className="text-xl font-semibold text-white">
                Get 10% off your first order
              </h3>
              <p className="mt-1 text-sm text-neutral-400">
                Subscribe for new arrivals, exclusive offers, and style inspiration
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-display text-2xl uppercase tracking-[0.2em] text-neutral-900">
              cartello
            </Link>
            <p className="mt-3 text-sm text-neutral-500 max-w-xs">
              Premium fashion for those who appreciate quality and style.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a href="#" className="text-neutral-400 hover:text-neutral-900 transition-colors" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href="#" className="text-neutral-400 hover:text-neutral-900 transition-colors" aria-label="X / Twitter">
                <XIcon />
              </a>
              <a href="#" className="text-neutral-400 hover:text-neutral-900 transition-colors" aria-label="Facebook">
                <FacebookIcon />
              </a>
            </div>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-neutral-900">{category}</h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-neutral-100 pt-8 sm:flex-row">
          <p className="text-sm text-neutral-400">
            © {new Date().getFullYear()} Cartello. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-neutral-400 hover:text-neutral-700">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-neutral-400 hover:text-neutral-700">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function InstagramIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

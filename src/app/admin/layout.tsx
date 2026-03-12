import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, BarChart3, ArrowLeft } from "lucide-react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/auth/sign-in")
  if (session.user?.role !== "ADMIN") redirect("/")

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 flex-shrink-0 border-r border-neutral-100 bg-white lg:block">
        <div className="flex h-16 items-center border-b border-neutral-100 px-6">
          <span className="text-lg font-bold tracking-tight text-neutral-900">Cartello Admin</span>
        </div>
        <nav className="px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <div className="mt-4 border-t border-neutral-100 pt-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-400 hover:text-neutral-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Store
            </Link>
          </div>
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center border-b border-neutral-100 px-6">
          <span className="text-sm text-neutral-500">
            Logged in as <strong>{session.user.email}</strong>
          </span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

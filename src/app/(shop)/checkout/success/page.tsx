import Link from "next/link"
import { CheckCircle } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Order Confirmed" }

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const { orderId } = await searchParams

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
        <CheckCircle className="h-10 w-10 text-green-500" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-neutral-900">Order Confirmed!</h1>
      <p className="mt-2 text-neutral-500">
        Thank you for your order. A confirmation email is on its way.
      </p>
      {orderId && (
        <p className="mt-3 rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700">
          Order #{orderId.slice(-8).toUpperCase()}
        </p>
      )}
      <div className="mt-8 flex gap-4">
        {orderId && (
          <Link
            href={`/account/orders/${orderId}`}
            className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-700"
          >
            Track Order
          </Link>
        )}
        <Link
          href="/products"
          className="rounded-full border border-neutral-200 px-6 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}

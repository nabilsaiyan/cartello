"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { toast } from "sonner"
import Image from "next/image"
import { useCartStore } from "@/store/cart-store"
import { formatPrice } from "@/lib/utils"
import { FREE_SHIPPING_THRESHOLD, SHIPPING_RATES } from "@/lib/constants"
import { checkoutSchema, type CheckoutInput } from "@/lib/validations"
import type { LocalCartItem } from "@/types"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
const STEPS = ["Contact & Shipping", "Shipping Method", "Payment"]

// ── Step 0: own form instance, validated by handleSubmit before advancing ──────
function ContactStep({
  defaultValues,
  onNext,
}: {
  defaultValues: CheckoutInput | null
  onNext: (data: CheckoutInput) => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: defaultValues ?? undefined,
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">Contact & Shipping</h2>

      <div>
        <input
          type="email"
          placeholder="Email address"
          autoComplete="email"
          {...register("email")}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-400"
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            placeholder="First name"
            autoComplete="given-name"
            {...register("address.firstName")}
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-400"
          />
          {errors.address?.firstName && <p className="mt-1 text-xs text-red-500">{errors.address.firstName.message}</p>}
        </div>
        <div>
          <input
            placeholder="Last name"
            autoComplete="family-name"
            {...register("address.lastName")}
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-400"
          />
          {errors.address?.lastName && <p className="mt-1 text-xs text-red-500">{errors.address.lastName.message}</p>}
        </div>
      </div>

      <div>
        <input
          placeholder="Address line 1"
          autoComplete="address-line1"
          {...register("address.address1")}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-400"
        />
        {errors.address?.address1 && <p className="mt-1 text-xs text-red-500">{errors.address.address1.message}</p>}
      </div>

      <input
        placeholder="Address line 2 (optional)"
        autoComplete="address-line2"
        {...register("address.address2")}
        className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-400"
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            placeholder="City"
            autoComplete="address-level2"
            {...register("address.city")}
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-400"
          />
          {errors.address?.city && <p className="mt-1 text-xs text-red-500">{errors.address.city.message}</p>}
        </div>
        <div>
          <input
            placeholder="Postal code"
            autoComplete="postal-code"
            {...register("address.postalCode")}
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-400"
          />
          {errors.address?.postalCode && <p className="mt-1 text-xs text-red-500">{errors.address.postalCode.message}</p>}
        </div>
      </div>

      <div>
        <select
          autoComplete="country"
          {...register("address.country")}
          className="w-full appearance-none rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-400"
        >
          <option value="">Select country</option>
          <optgroup label="Europe">
            <option value="IE">Ireland</option>
            <option value="GB">United Kingdom</option>
            <option value="FR">France</option>
            <option value="DE">Germany</option>
            <option value="ES">Spain</option>
            <option value="IT">Italy</option>
            <option value="NL">Netherlands</option>
            <option value="BE">Belgium</option>
            <option value="PT">Portugal</option>
            <option value="SE">Sweden</option>
            <option value="NO">Norway</option>
            <option value="DK">Denmark</option>
            <option value="FI">Finland</option>
            <option value="AT">Austria</option>
            <option value="CH">Switzerland</option>
            <option value="PL">Poland</option>
            <option value="CZ">Czech Republic</option>
            <option value="GR">Greece</option>
          </optgroup>
          <optgroup label="North America">
            <option value="US">United States</option>
            <option value="CA">Canada</option>
          </optgroup>
          <optgroup label="Asia Pacific">
            <option value="AU">Australia</option>
            <option value="NZ">New Zealand</option>
            <option value="JP">Japan</option>
            <option value="SG">Singapore</option>
            <option value="AE">United Arab Emirates</option>
          </optgroup>
        </select>
        {errors.address?.country && <p className="mt-1 text-xs text-red-500">{errors.address.country.message}</p>}
      </div>

      <button
        type="submit"
        className="w-full rounded-full bg-neutral-900 py-3.5 text-sm font-semibold text-white hover:bg-neutral-700"
      >
        Continue to Shipping
      </button>
    </form>
  )
}

// ── Step 1: shipping method selection ────────────────────────────────────────
function ShippingStep({
  total,
  shippingMethod,
  onSelect,
  onBack,
  onNext,
  submitting,
}: {
  total: number
  shippingMethod: "standard" | "express"
  onSelect: (m: "standard" | "express") => void
  onBack: () => void
  onNext: () => void
  submitting: boolean
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">Shipping Method</h2>
      {(["standard", "express"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onSelect(m)}
          className={`flex w-full items-center justify-between rounded-2xl border p-4 text-sm transition-all ${
            shippingMethod === m ? "border-neutral-900 bg-neutral-50" : "border-neutral-300"
          }`}
        >
          <p className="font-medium text-neutral-900">{SHIPPING_RATES[m].label}</p>
          <span className="font-semibold">
            {total >= FREE_SHIPPING_THRESHOLD && m === "standard"
              ? "Free"
              : formatPrice(SHIPPING_RATES[m].price)}
          </span>
        </button>
      ))}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-full border border-neutral-300 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={submitting}
          className="flex-1 rounded-full bg-neutral-900 py-3 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {submitting ? "Processing…" : "Continue to Payment"}
        </button>
      </div>
    </div>
  )
}

// ── Step 2: Stripe payment form ───────────────────────────────────────────────
function PaymentStep({
  clientSecret,
  orderId,
  onSuccess,
  onBack,
}: {
  clientSecret: string
  orderId: string
  onSuccess: () => void
  onBack: () => void
}) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-neutral-900">Payment</h2>
      <Elements
        stripe={stripePromise}
        options={{ clientSecret, appearance: { theme: "flat", variables: { borderRadius: "12px" } } }}
      >
        <StripeForm orderId={orderId} onSuccess={onSuccess} onBack={onBack} />
      </Elements>
    </div>
  )
}

function StripeForm({
  orderId,
  onSuccess,
  onBack,
}: {
  orderId: string
  onSuccess: () => void
  onBack: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [paying, setPaying] = useState(false)

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setPaying(true)
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
      },
      redirect: "if_required",
    })
    if (error) {
      toast.error(error.message ?? "Payment failed")
      setPaying(false)
    } else {
      await fetch(`/api/orders/${orderId}/confirm`, { method: "POST" }).catch(() => {})
      onSuccess()
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <PaymentElement />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-full border border-neutral-300 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || paying}
          className="flex-1 rounded-full bg-neutral-900 py-3 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {paying ? "Processing…" : "Pay Now"}
        </button>
      </div>
    </form>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const hasHydrated = useCartStore((s) => s._hasHydrated)
  const clearCart = useCartStore((s) => s.clearCart)
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [contactData, setContactData] = useState<CheckoutInput | null>(null)
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard")
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const shippingCost = total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATES[shippingMethod].price
  const orderTotal = total + shippingCost

  if (!hasHydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
      </div>
    )
  }

  if (itemCount === 0 && !orderId) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium">Your cart is empty</p>
        <Link
          href="/products"
          className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white"
        >
          Shop Now
        </Link>
      </div>
    )
  }

  function handleContactNext(data: CheckoutInput) {
    setContactData(data)
    setStep(1)
  }

  async function handleCreateOrder() {
    if (!contactData) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...contactData,
          shippingMethod,
          cartItems: items.map((i: LocalCartItem) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
            price: i.price,
            name: i.name,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed to create order")
        return
      }
      setClientSecret(data.clientSecret)
      setOrderId(data.orderId)
      setStep(2)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Progress */}
      <div className="mb-10 flex items-center justify-center">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                i <= step ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`ml-2 hidden text-sm sm:block ${
                i === step ? "font-medium text-neutral-900" : "text-neutral-400"
              }`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`mx-4 h-px w-12 ${i < step ? "bg-neutral-900" : "bg-neutral-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-12 lg:grid-cols-5">
        {/* Steps */}
        <div className="lg:col-span-3">
          {step === 0 && (
            <ContactStep defaultValues={contactData} onNext={handleContactNext} />
          )}
          {step === 1 && (
            <ShippingStep
              total={total}
              shippingMethod={shippingMethod}
              onSelect={setShippingMethod}
              onBack={() => setStep(0)}
              onNext={handleCreateOrder}
              submitting={submitting}
            />
          )}
          {step === 2 && clientSecret && orderId && (
            <PaymentStep
              clientSecret={clientSecret}
              orderId={orderId}
              onSuccess={() => {
                clearCart()
                router.push(`/checkout/success?orderId=${orderId}`)
              }}
              onBack={() => setStep(1)}
            />
          )}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-6">
            <h3 className="mb-4 font-semibold text-neutral-900">Order Summary</h3>
            <ul className="space-y-3 divide-y divide-neutral-100">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.variantId}`}
                  className="flex items-center gap-3 pt-3 first:pt-0"
                >
                  <div className="relative h-14 w-12 flex-shrink-0">
                    <div className="h-full w-full overflow-hidden rounded-lg bg-neutral-200">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-700 text-[10px] font-bold text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex flex-1 justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-900 line-clamp-1">
                        {item.name}
                      </p>
                      {(item.size || item.color) && (
                        <p className="text-xs text-neutral-400">
                          {[item.size, item.color].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 border-t border-neutral-200 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Shipping</span>
                <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-2 font-semibold">
                <span>Total</span>
                <span className="text-base">{formatPrice(orderTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

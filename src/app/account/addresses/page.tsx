"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Plus, Trash2, Star, ChevronUp } from "lucide-react"
import { Spinner } from "@/components/ui/Spinner"
import { Skeleton } from "@/components/ui/Skeleton"

interface Address {
  id: string
  firstName: string
  lastName: string
  address1: string
  address2?: string | null
  city: string
  state?: string | null
  postalCode: string
  country: string
  phone?: string | null
  isDefault: boolean
}

const COUNTRIES = [
  "Ireland", "United Kingdom", "France", "Germany", "Spain", "Italy",
  "Netherlands", "Belgium", "Portugal", "United States", "Canada", "Australia",
]

const inputCls = "w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-400"
const labelCls = "mb-1.5 block text-sm font-medium text-neutral-700"

function AddressForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    firstName: "", lastName: "", address1: "", address2: "",
    city: "", state: "", postalCode: "", country: "Ireland", phone: "", isDefault: false,
  })

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.address1 || !form.city || !form.postalCode || !form.country) {
      toast.error("Please fill in all required fields")
      return
    }
    setSubmitting(true)
    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        address2: form.address2 || undefined,
        state: form.state || undefined,
        phone: form.phone || undefined,
      }),
    })
    setSubmitting(false)
    if (res.ok) {
      toast.success("Address added")
      onSuccess()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? "Failed to add address")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>First name <span className="text-red-400">*</span></label>
          <input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Last name <span className="text-red-400">*</span></label>
          <input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Address line 1 <span className="text-red-400">*</span></label>
        <input value={form.address1} onChange={(e) => set("address1", e.target.value)} placeholder="Street address" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Address line 2 <span className="text-neutral-400 font-normal">(optional)</span></label>
        <input value={form.address2} onChange={(e) => set("address2", e.target.value)} placeholder="Apartment, suite, etc." className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>City <span className="text-red-400">*</span></label>
          <input value={form.city} onChange={(e) => set("city", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Postal code <span className="text-red-400">*</span></label>
          <input value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>State / County <span className="text-neutral-400 font-normal">(optional)</span></label>
          <input value={form.state} onChange={(e) => set("state", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Country <span className="text-red-400">*</span></label>
          <select value={form.country} onChange={(e) => set("country", e.target.value)} className={inputCls}>
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>Phone <span className="text-neutral-400 font-normal">(optional)</span></label>
        <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+353 …" className={inputCls} />
      </div>
      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => set("isDefault", e.target.checked)}
          className="h-4 w-4 rounded border-neutral-300 text-neutral-900"
        />
        Set as default address
      </label>
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {submitting && <Spinner className="h-3.5 w-3.5" />}
          {submitting ? "Saving…" : "Save Address"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium hover:bg-white">
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null)

  const fetchAddresses = useCallback(async () => {
    const res = await fetch("/api/account/addresses")
    const data = await res.json()
    setAddresses(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchAddresses() }, [fetchAddresses])

  async function handleDelete(id: string) {
    setDeletingId(id)
    const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" })
    setDeletingId(null)
    if (res.ok) {
      toast.success("Address removed")
      setAddresses((prev) => prev.filter((a) => a.id !== id))
    } else {
      toast.error("Failed to remove address")
    }
  }

  async function handleSetDefault(id: string) {
    setSettingDefaultId(id)
    const res = await fetch(`/api/account/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    })
    setSettingDefaultId(null)
    if (res.ok) {
      toast.success("Default address updated")
      fetchAddresses()
    } else {
      toast.error("Failed to update address")
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Addresses</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage your delivery addresses</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700"
        >
          {showForm ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add address"}
        </button>
      </div>

      {showForm && (
        <AddressForm
          onSuccess={() => { setShowForm(false); fetchAddresses() }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <div className="mt-4 space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
        </div>
      ) : addresses.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-neutral-100 py-16 text-center">
          <p className="text-neutral-500">No addresses saved yet</p>
          <p className="mt-1 text-sm text-neutral-400">Add a delivery address to speed up checkout</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-2xl border border-neutral-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm text-neutral-700 leading-relaxed">
                  <p className="font-semibold text-neutral-900">
                    {address.firstName} {address.lastName}
                    {address.isDefault && (
                      <span className="ml-2 rounded-full bg-neutral-900 px-2 py-0.5 text-xs font-medium text-white">Default</span>
                    )}
                  </p>
                  <p className="mt-1">{address.address1}</p>
                  {address.address2 && <p>{address.address2}</p>}
                  <p>{address.city}{address.state ? `, ${address.state}` : ""} {address.postalCode}</p>
                  <p>{address.country}</p>
                  {address.phone && <p className="mt-0.5 text-neutral-400">{address.phone}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      disabled={settingDefaultId === address.id}
                      title="Set as default"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-400 hover:border-neutral-300 hover:text-neutral-700 disabled:opacity-40"
                    >
                      {settingDefaultId === address.id ? <Spinner className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(address.id)}
                    disabled={deletingId === address.id}
                    title="Delete address"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-400 hover:border-red-200 hover:text-red-500 disabled:opacity-40"
                  >
                    {deletingId === address.id ? <Spinner className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

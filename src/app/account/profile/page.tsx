"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [name, setName] = useState("")

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name)
  }, [session?.user?.name])
  const [saving, setSaving] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    setSaving(false)
    if (res.ok) {
      await update({ name })
      toast.success("Profile updated")
    } else {
      toast.error("Failed to update profile")
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Profile Settings</h1>
      <div className="max-w-md rounded-2xl border border-neutral-100 p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Email</label>
            <input
              value={session?.user?.email ?? ""}
              disabled
              className="w-full rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm text-neutral-400"
            />
            <p className="mt-1 text-xs text-neutral-400">Email cannot be changed</p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/Spinner"

export function ProfileForm() {
  const { data: session, update } = useSession()
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  const isOAuthOnly = !session?.user?.email || !!session?.user?.image?.startsWith("https://")

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name)
  }, [session?.user?.name])

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

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    setChangingPassword(true)
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    setChangingPassword(false)
    if (res.ok) {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Password updated")
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? "Failed to update password")
    }
  }

  const inputCls = "w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-400"
  const disabledInputCls = "w-full rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm text-neutral-400"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Profile Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">Manage your personal information</p>
      </div>

      {/* Profile info */}
      <div className="max-w-md rounded-2xl border border-neutral-100 p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-400">Personal info</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Email</label>
            <input value={session?.user?.email ?? ""} disabled className={disabledInputCls} />
            <p className="mt-1 text-xs text-neutral-400">Email cannot be changed</p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            {saving && <Spinner className="h-3.5 w-3.5" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Password change — only for credential accounts */}
      <div className="max-w-md rounded-2xl border border-neutral-100 p-6">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-neutral-400">Change password</h2>
        {isOAuthOnly ? (
          <p className="mt-3 text-sm text-neutral-400">
            You signed in with OAuth. Password changes are not available for your account type.
          </p>
        ) : (
          <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={inputCls}
              />
            </div>
            <button
              type="submit"
              disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
            >
              {changingPassword && <Spinner className="h-3.5 w-3.5" />}
              {changingPassword ? "Updating…" : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

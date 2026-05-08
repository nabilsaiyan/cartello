import type { Metadata } from "next"
import { ProfileForm } from "./_ProfileForm"

export const metadata: Metadata = { title: "Profile Settings" }

export default function ProfilePage() {
  return <ProfileForm />
}

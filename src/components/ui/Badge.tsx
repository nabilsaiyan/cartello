import { cn } from "@/lib/utils"

interface BadgeProps {
  children?: React.ReactNode
  variant?: "default" | "sale" | "new" | "sold-out" | "success" | "warning"
  className?: string
}

const variants: Record<string, string> = {
  default:    "bg-white/90 text-neutral-700 border border-neutral-300 rounded px-2 py-0.5 font-display text-sm font-bold italic",
  new:        "bg-neutral-900/70 text-white rounded px-2.5 py-0.5 font-display text-sm font-bold italic backdrop-blur-sm",
  sale:       "bg-[#c8a96e]/75 text-neutral-950 rounded px-2.5 py-0.5 font-display text-sm font-bold italic backdrop-blur-sm",
  "sold-out": "bg-white/80 backdrop-blur-sm text-neutral-500 border border-neutral-300/60 rounded px-2 py-0.5 font-display text-sm font-bold italic",
  success:    "bg-green-100 text-green-700 rounded px-2 py-0.5 font-display text-sm font-bold italic",
  warning:    "bg-amber-100 text-amber-700 rounded px-2 py-0.5 font-display text-sm font-bold italic",
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const label = variant === "new" ? "New In" : children
  return (
    <span className={cn("inline-flex items-center justify-center leading-none", variants[variant] ?? variants.default, className)}>
      {label}
    </span>
  )
}

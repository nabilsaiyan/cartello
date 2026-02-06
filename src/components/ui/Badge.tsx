import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "sale" | "new" | "sold-out" | "success" | "warning"
  className?: string
}

const variants = {
  default: "bg-neutral-100 text-neutral-700",
  sale: "bg-red-500 text-white",
  new: "bg-neutral-900 text-white",
  "sold-out": "bg-neutral-300 text-neutral-600",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

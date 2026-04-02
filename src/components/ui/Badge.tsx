import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "sale" | "new" | "sold-out" | "success" | "warning"
  className?: string
}

const variants: Record<string, string> = {
  default: "bg-white/90 text-neutral-700 border border-neutral-300 rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em]",
  sale: "bg-[#c8a96e] text-neutral-950 rounded px-2 py-0.5 text-[11px] font-bold tracking-tight",
  new: "bg-neutral-950/60 backdrop-blur-sm text-white border border-white/10 rounded px-2.5 py-0.5 font-display italic text-sm font-light normal-case tracking-normal",
  "sold-out": "bg-white/80 backdrop-blur-sm text-neutral-500 border border-neutral-300/60 rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em]",
  success: "bg-green-100 text-green-700 rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em]",
  warning: "bg-amber-100 text-amber-700 rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em]",
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center", variants[variant], className)}>
      {children}
    </span>
  )
}

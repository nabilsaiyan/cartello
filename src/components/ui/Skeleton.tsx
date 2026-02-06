import { cn } from "@/lib/utils"

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-neutral-100",
        className
      )}
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[3/4] w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-5 w-1/3" />
    </div>
  )
}

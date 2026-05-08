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

export function FiltersSkeleton() {
  return (
    <div className="w-48 shrink-0 space-y-6 py-1">
      <div className="space-y-2.5">
        <Skeleton className="h-3.5 w-20" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      <div className="space-y-2.5">
        <Skeleton className="h-3.5 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1 rounded-full" />
          <Skeleton className="h-9 flex-1 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function SortSkeleton() {
  return <Skeleton className="h-9 w-28 rounded-full" />
}

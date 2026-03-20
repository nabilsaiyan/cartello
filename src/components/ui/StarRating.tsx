import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  max?: number
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onRate?: (rating: number) => void
}

export function StarRating({
  rating,
  max = 5,
  size = "md",
  interactive = false,
  onRate,
}: StarRatingProps) {
  const sizes = { sm: "h-3.5 w-3.5", md: "h-4.5 w-4.5", lg: "h-5.5 w-5.5" }

  return (
    <div className="flex items-center gap-0.5" role={interactive ? undefined : "img"} aria-label={interactive ? undefined : `Rating: ${rating} out of ${max}`}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating)
        const partial = !filled && i < rating

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onRate?.(i + 1)}
            aria-label={interactive ? `Rate ${i + 1} out of ${max}` : undefined}
            className={cn(
              "relative",
              interactive && "cursor-pointer hover:scale-110 transition-transform",
              !interactive && "cursor-default pointer-events-none"
            )}
          >
            <svg
              className={cn(sizes[size], "text-neutral-200")}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {(filled || partial) && (
              <svg
                className={cn(
                  sizes[size],
                  "absolute inset-0 text-amber-400",
                  partial && "clip-path-[inset(0_50%_0_0)]"
                )}
                viewBox="0 0 20 20"
                fill="currentColor"
                style={partial ? { clipPath: `inset(0 ${100 - (rating % 1) * 100}% 0 0)` } : undefined}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </button>
        )
      })}
    </div>
  )
}

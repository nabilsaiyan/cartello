"use client"

import { cn } from "@/lib/utils"
import type { Variant } from "@/generated/prisma/client"

interface VariantSelectorProps {
  variants: Variant[]
  selectedId: string | null
  onSelect: (variant: Variant) => void
}

export function VariantSelector({ variants, selectedId, onSelect }: VariantSelectorProps) {
  const sizes = [...new Set(variants.filter((v) => v.size).map((v) => v.size!))]
  const colors = [...new Set(variants.filter((v) => v.color).map((v) => v.color!))]

  const selectedVariant = variants.find((v) => v.id === selectedId)

  function getVariant(size?: string, color?: string) {
    return variants.find(
      (v) =>
        (!size || v.size === size) &&
        (!color || v.color === color)
    )
  }

  function selectSize(size: string) {
    const targetColor = selectedVariant?.color ?? colors[0]
    const v = getVariant(size, targetColor) ?? getVariant(size)
    if (v) onSelect(v)
  }

  function selectColor(color: string) {
    const targetSize = selectedVariant?.size ?? sizes[0]
    const v = getVariant(targetSize, color) ?? getVariant(undefined, color)
    if (v) onSelect(v)
  }

  return (
    <div className="space-y-4">
      {colors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-900">
              Color
              {selectedVariant?.color && (
                <span className="ml-2 font-normal text-neutral-500">
                  — {selectedVariant.color}
                </span>
              )}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const variant = getVariant(selectedVariant?.size ?? undefined, color)
              const colorHex = variants.find((v) => v.color === color)?.colorHex
              const outOfStock = variant ? variant.stock === 0 : false
              const isSelected = selectedVariant?.color === color

              return (
                <button
                  key={color}
                  onClick={() => selectColor(color)}
                  disabled={outOfStock}
                  aria-label={`${color}${outOfStock ? " — out of stock" : ""}`}
                  aria-pressed={isSelected}
                  className={cn(
                    "relative flex h-11 w-11 items-center justify-center rounded-full transition-all",
                    isSelected ? "ring-2 ring-neutral-900 ring-offset-1" : "ring-1 ring-neutral-300 hover:ring-neutral-400",
                    outOfStock && "opacity-40 cursor-not-allowed"
                  )}
                  style={{ backgroundColor: colorHex ?? "#ccc" }}
                >
                  {outOfStock && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="h-px w-6 rotate-45 bg-neutral-400" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <span className="mb-2 block text-sm font-medium text-neutral-900">
            Size
            {selectedVariant?.size && (
              <span className="ml-2 font-normal text-neutral-500">
                — {selectedVariant.size}
              </span>
            )}
          </span>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const variant = getVariant(size, selectedVariant?.color ?? undefined)
              const outOfStock = variant ? variant.stock === 0 : false
              const isSelected = selectedVariant?.size === size

              return (
                <button
                  key={size}
                  onClick={() => selectSize(size)}
                  disabled={outOfStock}
                  className={cn(
                    "min-w-[3rem] rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                    isSelected
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 text-neutral-700 hover:border-neutral-400",
                    outOfStock && "opacity-40 cursor-not-allowed line-through"
                  )}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

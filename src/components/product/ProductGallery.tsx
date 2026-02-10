"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [selected, setSelected] = useState(0)

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex flex-row gap-2 md:flex-col md:w-20">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={cn(
                "relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                selected === i
                  ? "border-neutral-900"
                  : "border-transparent hover:border-neutral-300"
              )}
            >
              <Image
                src={img}
                alt={`${name} ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative flex-1 overflow-hidden rounded-2xl bg-neutral-100">
        <div className="aspect-[4/5] relative">
          {images[selected] && (
            <Image
              src={images[selected]}
              alt={name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )}
        </div>
      </div>
    </div>
  )
}

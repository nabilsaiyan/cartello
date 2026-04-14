"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  images: string[]
  name: string
  activeImage?: number
}

export function ProductGallery({ images, name, activeImage }: ProductGalleryProps) {
  const [selected, setSelected] = useState(activeImage ?? 0)
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    if (activeImage !== undefined) setSelected(activeImage)
  }, [activeImage])

  return (
    <>
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
          <div
            className="aspect-[4/5] relative group cursor-zoom-in"
            onClick={() => setZoomed(true)}
          >
            {images[selected] && (
              <Image
                src={images[selected]}
                alt={name}
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
            <div className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
              <ZoomIn className="h-4 w-4 text-neutral-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoomed(false)}
        >
          <button
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            onClick={() => setZoomed(false)}
            aria-label="Close zoom"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative max-h-[90vh] max-w-[90vw] aspect-[4/5] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {images[selected] && (
              <Image
                src={images[selected]}
                alt={name}
                fill
                className="object-contain"
                sizes="90vw"
              />
            )}
          </div>
          {/* Thumbnail nav inside lightbox */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setSelected(i) }}
                  className={cn(
                    "relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                    selected === i ? "border-white" : "border-white/30 hover:border-white/60"
                  )}
                >
                  <Image src={img} alt={`${name} ${i + 1}`} fill className="object-cover" sizes="56px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

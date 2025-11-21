"use client"

import React, { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export interface HeroImageProps {
  src: string;
  alt: string;
  overlay?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/**
 * HeroImage Component
 *
 * A hero image component designed for landing pages with optional text overlay.
 * Uses Next.js Image component for automatic optimization and performance.
 *
 * @param src - Image source path (should be in /public/images/)
 * @param alt - Alternative text for accessibility
 * @param overlay - Optional text overlay content
 * @param className - Additional CSS classes
 * @param width - Image width (defaults to 1920)
 * @param height - Image height (defaults to 1080)
 * @param priority - Whether to prioritize loading (default: true for hero images)
 */
const HeroImage = React.forwardRef<HTMLDivElement, HeroImageProps>(
  ({
    src,
    alt,
    overlay,
    className,
    width = 1920,
    height = 1080,
    priority = true
  }, ref) => {
    const [imageError, setImageError] = useState(false)
    const [scrollOffset, setScrollOffset] = useState(0)

    const handleImageError = () => {
      console.warn(`Failed to load hero image: ${src}`)
      setImageError(true)
    }

    useEffect(() => {
      const handleScroll = () => {
        const currentOffset = window.scrollY
        setScrollOffset(Math.min(currentOffset * 0.12, 72))
      }

      handleScroll()
      window.addEventListener("scroll", handleScroll, { passive: true })
      return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const parallaxStyle = useMemo(
      () => ({
        transform: `translateY(-${scrollOffset * 0.35}px) scale(1.05)`,
      }),
      [scrollOffset]
    )

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden rounded-b-[32px] bg-gradient-to-b from-wedding-dustyPink-50 to-wedding-lavender-100",
          className
        )}
        role="banner"
        aria-label={overlay ? `Hero section: ${overlay}` : alt}
      >
        {!imageError ? (
          <div
            className="absolute inset-0 will-change-transform"
            style={parallaxStyle}
            aria-hidden
          >
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              priority={priority}
              className="h-full w-full object-cover animate-slow-pan"
              sizes="100vw"
              onError={handleImageError}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAD/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAICEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          </div>
        ) : (
          // Fallback when image fails to load
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              aspectRatio: `${width}/${height}`,
              background: `linear-gradient(to bottom right,
                rgb(var(--wedding-dusty-pink-50)),
                rgb(var(--wedding-rose-gold-50)),
                rgb(var(--wedding-lavender-50)))`
            }}
            aria-label="Image placeholder"
          >
            <div className="text-center p-8">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `rgb(var(--wedding-dusty-pink-300))` }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: `rgb(var(--wedding-dusty-pink-600))` }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p
                className="text-sm font-medium"
                style={{ color: `rgb(var(--wedding-dusty-pink-600))` }}
              >
                Image not available
              </p>
            </div>
          </div>
        )}

        {/* Gradient & texture overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/60" aria-hidden />
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(213, 145, 185, 0.25), transparent 35%), radial-gradient(circle at 80% 0%, rgba(212, 160, 86, 0.25), transparent 38%), radial-gradient(circle at 50% 75%, rgba(107, 31, 65, 0.25), transparent 40%)",
          }}
          aria-hidden
        />

        {/* Text Overlay */}
        {overlay && (
          <div className="absolute inset-0 flex items-center justify-center px-4 md:px-8">
            <div className="text-center text-white px-6 py-10 max-w-4xl bg-black/25 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl animate-fade-in-up">
              <p className="text-sm uppercase tracking-[0.35em] text-wedding-roseGold-100 mb-4">You&apos;re invited</p>
              <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight drop-shadow-2xl">
                {overlay}
              </h1>
              <p className="mt-6 text-lg text-wedding-roseGold-50 max-w-2xl mx-auto">
                Join us in Washington&apos;s lavender fields for a celebration filled with warmth, joy, and unforgettable memories.
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }
)

HeroImage.displayName = "HeroImage";

export { HeroImage };

"use client"

import React, { useState } from "react"
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
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
      console.warn(`Failed to load hero image: ${src}`);
      setImageError(true);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden",
          className
        )}
        role="banner"
        aria-label={overlay ? `Hero section: ${overlay}` : alt}
      >
        {!imageError ? (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            className="w-full h-full object-cover"
            sizes="100vw"
            onError={handleImageError}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
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

        {/* Text Overlay */}
        {overlay && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white px-6 py-8 max-w-4xl">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight drop-shadow-lg">
                {overlay}
              </h1>
            </div>
          </div>
        )}
      </div>
    );
  }
);

HeroImage.displayName = "HeroImage";

export { HeroImage };
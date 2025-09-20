"use client"

import React, { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export interface PageBannerProps {
  src: string;
  alt: string;
  height?: number;
  className?: string;
  width?: number;
  priority?: boolean;
}

/**
 * PageBanner Component
 *
 * A decorative banner component for page headers and section dividers.
 * Optimized for horizontal banner images with responsive design.
 *
 * @param src - Image source path (should be in /public/images/)
 * @param alt - Alternative text for accessibility
 * @param height - Banner height in pixels (defaults to 300)
 * @param className - Additional CSS classes
 * @param width - Image width (defaults to 1200)
 * @param priority - Whether to prioritize loading (default: false for decorative banners)
 */
const PageBanner = React.forwardRef<HTMLDivElement, PageBannerProps>(
  ({
    src,
    alt,
    height = 300,
    className,
    width = 1200,
    priority = false
  }, ref) => {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
      console.warn(`Failed to load banner image: ${src}`);
      setImageError(true);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden",
          className
        )}
        style={{ height: `${height}px` }}
        role="img"
        aria-label={alt}
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
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        ) : (
          // Fallback when image fails to load
          <div
            className="w-full h-full flex items-center justify-center border-t border-b"
            style={{
              background: `linear-gradient(to right,
                rgb(var(--wedding-dusty-pink-50)),
                rgb(var(--wedding-lavender-50)),
                rgb(var(--wedding-rose-gold-50)),
                rgb(var(--wedding-dusty-pink-50)))`,
              borderTopColor: `rgb(var(--wedding-dusty-pink-200))`,
              borderBottomColor: `rgb(var(--wedding-dusty-pink-200))`
            }}
            aria-label="Banner placeholder"
          >
            <div className="text-center">
              <div
                className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `rgb(var(--wedding-lavender-200))` }}
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: `rgb(var(--wedding-lavender-500))` }}
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
                className="text-xs font-medium"
                style={{ color: `rgb(var(--wedding-lavender-400))` }}
              >
                Decorative banner
              </p>
            </div>
          </div>
        )}

        {/* Optional overlay for enhanced readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-10 pointer-events-none" />
      </div>
    );
  }
);

PageBanner.displayName = "PageBanner";

export { PageBanner };
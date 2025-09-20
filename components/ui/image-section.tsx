"use client"

import React, { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export interface ImageSectionProps {
  src: string;
  alt: string;
  title?: string;
  description?: string;
  className?: string;
  width?: number;
  height?: number;
  imagePosition?: "left" | "right" | "top" | "bottom";
  priority?: boolean;
}

/**
 * ImageSection Component
 *
 * A flexible component that combines images with text content in various layouts.
 * Supports different positioning options and responsive design.
 *
 * @param src - Image source path (should be in /public/images/)
 * @param alt - Alternative text for accessibility
 * @param title - Optional title text to display
 * @param description - Optional description text to display
 * @param className - Additional CSS classes
 * @param width - Image width (defaults to 600)
 * @param height - Image height (defaults to 400)
 * @param imagePosition - Position of image relative to text (defaults to "left")
 * @param priority - Whether to prioritize loading (default: false)
 */
const ImageSection = React.forwardRef<HTMLDivElement, ImageSectionProps>(
  ({
    src,
    alt,
    title,
    description,
    className,
    width = 600,
    height = 400,
    imagePosition = "left",
    priority = false
  }, ref) => {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
      console.warn(`Failed to load section image: ${src}`);
      setImageError(true);
    };

    const hasContent = title || description;

    // Layout classes based on image position
    const getLayoutClasses = () => {
      if (!hasContent) return "flex justify-center";

      switch (imagePosition) {
        case "right":
          return "flex flex-col md:flex-row-reverse gap-6 md:gap-8 items-center";
        case "top":
          return "flex flex-col gap-6 items-center text-center";
        case "bottom":
          return "flex flex-col-reverse gap-6 items-center text-center";
        default: // "left"
          return "flex flex-col md:flex-row gap-6 md:gap-8 items-center";
      }
    };

    const ImageComponent = (
      <div className="flex-shrink-0">
        {!imageError ? (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            className="rounded-lg shadow-md object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={handleImageError}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        ) : (
          // Fallback when image fails to load
          <div
            className="rounded-lg shadow-md bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
            style={{ width: `${width}px`, height: `${height}px` }}
            aria-label="Image placeholder"
          >
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-300 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-500"
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
              <p className="text-sm text-gray-500 font-medium">Image not available</p>
            </div>
          </div>
        )}
      </div>
    );

    const ContentComponent = hasContent ? (
      <div className={cn(
        "flex-1",
        imagePosition === "top" || imagePosition === "bottom" ? "text-center" : ""
      )}>
        {title && (
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
        )}
        {description && (
          <div className="text-gray-600 leading-relaxed">
            {typeof description === 'string' ? (
              <p>{description}</p>
            ) : (
              description
            )}
          </div>
        )}
      </div>
    ) : null;

    return (
      <section
        ref={ref}
        className={cn(
          "w-full",
          getLayoutClasses(),
          className
        )}
        aria-labelledby={title ? `section-title-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined}
      >
        {hasContent ? (
          <>
            {imagePosition === "right" || imagePosition === "bottom" ? (
              <>
                <div className="flex-1">
                  {title && (
                    <h2
                      id={`section-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
                      className="text-2xl md:text-3xl font-bold text-gray-900 mb-4"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <div className="text-gray-600 leading-relaxed">
                      {typeof description === 'string' ? (
                        <p>{description}</p>
                      ) : (
                        description
                      )}
                    </div>
                  )}
                </div>
                {ImageComponent}
              </>
            ) : (
              <>
                {ImageComponent}
                <div className="flex-1">
                  {title && (
                    <h2
                      id={`section-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
                      className="text-2xl md:text-3xl font-bold text-gray-900 mb-4"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <div className="text-gray-600 leading-relaxed">
                      {typeof description === 'string' ? (
                        <p>{description}</p>
                      ) : (
                        description
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          ImageComponent
        )}
      </section>
    );
  }
);

ImageSection.displayName = "ImageSection";

export { ImageSection };
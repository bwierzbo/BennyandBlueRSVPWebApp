# Image Components Documentation

This directory contains reusable image components built for the wedding RSVP website. All components use Next.js Image component for automatic optimization and are designed with TypeScript for type safety.

## Components

### HeroImage Component

A hero image component designed for landing pages with optional text overlay capability.

**File**: `hero-image.tsx`

**Props**:
- `src` (string): Image source path (should be in `/public/images/`)
- `alt` (string): Alternative text for accessibility
- `overlay?` (string): Optional text overlay content
- `className?` (string): Additional CSS classes
- `width?` (number): Image width (defaults to 1920)
- `height?` (number): Image height (defaults to 1080)
- `priority?` (boolean): Whether to prioritize loading (default: true for hero images)

**Usage Example**:
```tsx
import { HeroImage } from "@/components/ui"

<HeroImage
  src="/images/hero.jpg"
  alt="Wedding celebration"
  overlay="Benny & Blue's Wedding"
  className="h-96"
/>
```

**Features**:
- Text overlay with responsive typography
- Error handling with graceful fallback
- Priority loading for above-the-fold content
- Proper ARIA labels and accessibility
- Loading placeholder with blur effect

### PageBanner Component

A decorative banner component for page headers and section dividers.

**File**: `page-banner.tsx`

**Props**:
- `src` (string): Image source path (should be in `/public/images/`)
- `alt` (string): Alternative text for accessibility
- `height?` (number): Banner height in pixels (defaults to 300)
- `className?` (string): Additional CSS classes
- `width?` (number): Image width (defaults to 1200)
- `priority?` (boolean): Whether to prioritize loading (default: false for decorative banners)

**Usage Example**:
```tsx
import { PageBanner } from "@/components/ui"

<PageBanner
  src="/images/floral-banner.jpg"
  alt="Floral decorative banner"
  height={200}
/>
```

**Features**:
- Optimized for horizontal banner layouts
- Subtle overlay for enhanced visual appeal
- Error handling with styled fallback
- Responsive design
- Lazy loading by default

### ImageSection Component

A flexible component that combines images with text content in various layouts.

**File**: `image-section.tsx`

**Props**:
- `src` (string): Image source path (should be in `/public/images/`)
- `alt` (string): Alternative text for accessibility
- `title?` (string): Optional title text to display
- `description?` (string): Optional description text to display
- `className?` (string): Additional CSS classes
- `width?` (number): Image width (defaults to 600)
- `height?` (number): Image height (defaults to 400)
- `imagePosition?` ("left" | "right" | "top" | "bottom"): Position of image relative to text (defaults to "left")
- `priority?` (boolean): Whether to prioritize loading (default: false)

**Usage Examples**:
```tsx
import { ImageSection } from "@/components/ui"

// Image with text content
<ImageSection
  src="/images/engagement.jpg"
  alt="Engagement photo"
  title="Our Story"
  description="From our first meeting to this moment..."
  imagePosition="right"
/>

// Standalone image
<ImageSection
  src="/images/floral-banner.jpg"
  alt="Standalone floral image"
  width={800}
  height={200}
/>
```

**Features**:
- Four layout positions: left, right, top, bottom
- Works with or without text content
- Responsive design with mobile optimization
- Error handling with styled placeholder
- Proper semantic HTML structure
- Automatic text alignment based on image position

## Common Features

All image components share these features:

### Error Handling
- Graceful fallback when images fail to load
- Console warnings for debugging
- Styled placeholder components with appropriate messaging
- No broken image icons or layout shifts

### Performance Optimization
- Next.js Image component integration
- Lazy loading by default (except hero images)
- Responsive image sizing with `sizes` attribute
- Blur placeholder for perceived performance
- Progressive JPEG support

### Accessibility
- Required `alt` text for all images
- Proper ARIA labels and roles
- Semantic HTML structure
- Keyboard navigation support
- Screen reader compatibility

### Responsive Design
- Mobile-first approach
- Flexible layouts that adapt to screen size
- Tailwind CSS utility classes
- Consistent spacing and typography

## Testing

To test all components, visit `/component-test` in development mode. This page demonstrates:
- All three components with different configurations
- Error handling with missing images
- Various layout options and styling
- Responsive behavior across devices

## Integration

Components can be imported individually or as a group:

```tsx
// Individual imports
import { HeroImage } from "@/components/ui/hero-image"
import { PageBanner } from "@/components/ui/page-banner"
import { ImageSection } from "@/components/ui/image-section"

// Group import
import { HeroImage, PageBanner, ImageSection } from "@/components/ui"
```

## Available Images

The following optimized images are available in `/public/images/`:
- `hero.jpg` (1920x1080) - Main hero image
- `floral-banner.jpg` (1200x300) - Decorative banner
- `engagement.jpg` (600x400) - Couple photo placeholder
- `thank-you-flowers.jpg` (800x600) - Thank you page image
- `rsvp-card-icon.png` (64x64) - Small accent icon
- `rsvp-card-icon.svg` - Vector version of icon

## Technical Requirements

- Next.js 14+ with App Router
- React 18+
- TypeScript
- Tailwind CSS
- Client-side rendering (components use `"use client"` directive)

All components are fully typed with TypeScript interfaces and include comprehensive JSDoc documentation.
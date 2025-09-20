# Wedding RSVP Images Documentation

This directory contains placeholder images for the wedding RSVP website. All images are optimized for web delivery and compatible with Next.js Image component.

## Image Inventory

### Hero Image
- **File**: `hero.jpg`
- **Dimensions**: 1920x1080px
- **Size**: ~187KB
- **Usage**: Main hero banner for homepage
- **Format**: Progressive JPEG
- **Source**: Unsplash (Public Domain)

### Floral Banner
- **File**: `floral-banner.jpg`
- **Dimensions**: 1200x300px
- **Size**: ~61KB
- **Usage**: Decorative header banner
- **Format**: Progressive JPEG
- **Source**: Unsplash (Public Domain)

### RSVP Card Icon
- **File**: `rsvp-card-icon.png`
- **Dimensions**: 64x64px
- **Size**: ~5KB
- **Usage**: Small accent icon for RSVP functionality
- **Format**: JPEG (despite .png extension)
- **Source**: Unsplash (Public Domain)

### Thank You Flowers
- **File**: `thank-you-flowers.jpg`
- **Dimensions**: 800x600px
- **Size**: ~53KB
- **Usage**: Gratitude-themed image for thank you page
- **Format**: Progressive JPEG
- **Source**: Unsplash (Public Domain)

### Engagement Photo
- **File**: `engagement.jpg`
- **Dimensions**: 600x400px
- **Size**: ~53KB
- **Usage**: Placeholder couple photo
- **Format**: Progressive JPEG
- **Source**: Unsplash (Public Domain)

## Usage Guidelines

### Next.js Image Component

All images are compatible with Next.js Image component. Example usage:

```tsx
import Image from 'next/image'

// Hero image
<Image
  src="/images/hero.jpg"
  alt="Wedding celebration"
  width={1920}
  height={1080}
  priority // Use for above-the-fold images
/>

// Banner image
<Image
  src="/images/floral-banner.jpg"
  alt="Floral banner"
  width={1200}
  height={300}
/>

// Icon
<Image
  src="/images/rsvp-card-icon.png"
  alt="RSVP icon"
  width={64}
  height={64}
/>
```

### Responsive Images

For responsive designs, consider using the `sizes` prop:

```tsx
<Image
  src="/images/hero.jpg"
  alt="Wedding celebration"
  width={1920}
  height={1080}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

## Optimization Details

- All images are progressive JPEGs for faster perceived loading
- Images are pre-optimized for web delivery (72 DPI)
- File sizes are balanced for quality vs. performance
- Dimensions match common viewport sizes and design requirements

## Source Attribution

All images are sourced from Unsplash and are free for commercial use without attribution requirements. However, for good practice:

- **Source**: Unsplash.com
- **License**: Unsplash License (free for commercial and personal use)
- **Attribution**: Not required but appreciated

## File Structure

```
public/images/
├── README.md               # This documentation
├── .gitkeep               # Git directory tracking
├── hero.jpg               # Main hero image
├── floral-banner.jpg      # Decorative banner
├── rsvp-card-icon.png     # Small accent icon
├── rsvp-card-icon.svg     # SVG version of icon
├── thank-you-flowers.jpg  # Thank you page image
└── engagement.jpg         # Couple photo placeholder
```

## Performance Notes

- Total image directory size: ~360KB
- All images use progressive JPEG encoding
- Images are served statically from `/public/images/`
- Next.js automatically optimizes images when served through Image component
- Consider using `priority` prop for above-the-fold images
- Consider lazy loading for below-the-fold images (default behavior)

## Future Considerations

- Consider WebP format for better compression in modern browsers
- Implement responsive image sets for different screen densities
- Add image compression for even smaller file sizes if needed
- Consider CDN delivery for production environments
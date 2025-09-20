---
created: 2025-09-20T15:27:21Z
last_updated: 2025-09-20T15:27:21Z
version: 1.0
author: Claude Code PM System
---

# Technical Context

## Core Technology Stack

### Runtime & Framework
- **Node.js**: 18+ (LTS)
- **Next.js**: ^15.0.0 (App Router)
- **React**: ^18.0.0
- **TypeScript**: ^5.0.0

### Database & Backend
- **Database**: PostgreSQL via Neon
- **ORM/Client**: @vercel/postgres ^0.9.0
- **Validation**: Zod ^3.22.0
- **Forms**: React Hook Form ^7.49.0 + @hookform/resolvers ^5.2.2

### Styling & UI
- **CSS Framework**: TailwindCSS ^3.3.0
- **Wedding Color System**: Custom Tailwind palette (dusty pink, rose gold, lavender)
- **Typography**: Inter font family with system fallbacks
- **Utilities**: clsx ^2.0.0, tailwind-merge ^2.0.0

### Development Tools
- **Build Tool**: Next.js built-in (Turbopack)
- **Linting**: ESLint ^8.0.0 with Next.js config
- **Package Manager**: npm (with package-lock.json)
- **Task Runner**: npm scripts
- **Development Server**: Next.js dev server

## Dependencies Analysis

### Production Dependencies (7 packages)
```json
{
  "@hookform/resolvers": "^5.2.2",    // Form validation integration
  "@vercel/postgres": "^0.9.0",       // PostgreSQL client
  "clsx": "^2.0.0",                   // Conditional CSS classes
  "next": "^15.0.0",                  // React framework
  "react": "^18.0.0",                 // React library
  "react-dom": "^18.0.0",             // React DOM bindings
  "react-hook-form": "^7.49.0",       // Form state management
  "tailwind-merge": "^2.0.0",         // TailwindCSS utility merging
  "zod": "^3.22.0"                    // Schema validation
}
```

### Development Dependencies (8 packages)
```json
{
  "@types/node": "^20.0.0",           // Node.js TypeScript types
  "@types/react": "^18.0.0",          // React TypeScript types
  "@types/react-dom": "^18.0.0",      // React DOM TypeScript types
  "autoprefixer": "^10.0.1",          // CSS vendor prefixes
  "eslint": "^8.0.0",                 // JavaScript/TypeScript linting
  "eslint-config-next": "^15.0.0",    // Next.js ESLint configuration
  "postcss": "^8.4.0",                // CSS transformation
  "tailwindcss": "^3.3.0",            // Utility-first CSS framework
  "tsx": "^4.20.5",                   // TypeScript execution
  "typescript": "^5.0.0"              // TypeScript compiler
}
```

## Configuration Files

### TailwindCSS Configuration
- **Extended Color Palette**: Wedding colors (dusty pink, rose gold, lavender, gray)
- **Font Configuration**: Inter font family
- **Responsive Design**: Mobile-first breakpoints
- **Custom Properties**: CSS variables for wedding colors

### TypeScript Configuration
- **Strict Mode**: Enabled for type safety
- **Path Mapping**: @/ alias for absolute imports
- **Next.js Integration**: App Router support
- **Target**: ES2017 for modern browser support

### Next.js Configuration
- **App Router**: Enabled (default in Next.js 15)
- **TypeScript**: Full TypeScript support
- **Image Optimization**: Built-in Next.js Image component
- **CSS**: TailwindCSS via PostCSS

### Build Configuration
- **PostCSS**: Autoprefixer + TailwindCSS
- **Bundle Analysis**: Next.js built-in analyzer
- **Optimization**: Automatic code splitting and tree shaking

## Database Technology

### PostgreSQL with Neon
- **Provider**: Neon (serverless PostgreSQL)
- **Client**: @vercel/postgres (optimized for serverless)
- **Connection Pooling**: Built-in Neon pooling
- **SSL**: Required for secure connections

### Database Schema
- **Tables**: RSVP responses, guest information
- **Constraints**: Email uniqueness, required fields
- **Indexing**: Optimized for common queries
- **Migrations**: Script-based initialization

## Performance Optimizations

### Next.js Features
- **App Router**: Server-side rendering and streaming
- **Image Optimization**: Automatic WebP conversion and sizing
- **Code Splitting**: Automatic route-based splitting
- **Caching**: Built-in request and data caching

### CSS Optimization
- **TailwindCSS Purging**: Removes unused styles
- **CSS Custom Properties**: Efficient color system
- **Minimal Bundle**: Only used utilities included
- **Critical CSS**: Inline critical styles

### Runtime Performance
- **Server Actions**: Reduced client-side JavaScript
- **Progressive Enhancement**: Works without JavaScript
- **Lazy Loading**: Images and non-critical components
- **Bundle Size**: Optimized dependency selection

## Development Workflow

### Available Scripts
```bash
npm run dev          # Development server (localhost:3000)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint checking
npm run type-check   # TypeScript compilation check
npm run db:init      # Initialize database tables
npm run db:test      # Test database connection
```

### Code Quality Tools
- **TypeScript**: Compile-time type checking
- **ESLint**: Code style and best practices
- **Next.js Built-in**: Performance and accessibility warnings
- **Zod**: Runtime data validation

## Deployment Configuration

### Vercel Integration
- **Platform**: Vercel (optimized for Next.js)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Node.js Version**: 18.x
- **Environment Variables**: Production configuration

### Environment Requirements
- **PostgreSQL**: Neon connection strings
- **Secrets**: NextAuth secret for security
- **URLs**: Production domain configuration
- **Analytics**: Optional performance monitoring

## Security Considerations

### Data Validation
- **Client-side**: React Hook Form + Zod
- **Server-side**: Zod schema validation
- **Type Safety**: Full TypeScript coverage
- **Input Sanitization**: Automatic via validation schemas

### Database Security
- **Parameterized Queries**: SQL injection protection
- **Connection Security**: SSL-required connections
- **Access Control**: Environment-based configuration
- **Data Validation**: Schema-enforced constraints

## Browser Support

### Target Browsers
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (last 2 versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **JavaScript**: ES2017+ features
- **CSS**: Modern CSS features via PostCSS

### Progressive Enhancement
- **Core Functionality**: Works without JavaScript
- **Enhanced UX**: JavaScript progressively enhances
- **Responsive Design**: Works on all device sizes
- **Accessibility**: WCAG AA compliance

This technical foundation provides a modern, performant, and maintainable platform for the wedding RSVP application with excellent developer experience and production readiness.
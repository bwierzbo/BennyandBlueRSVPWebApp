---
created: 2025-09-20T15:27:21Z
last_updated: 2025-09-20T15:27:21Z
version: 1.0
author: Claude Code PM System
---

# Project Structure

## Directory Organization

### Root Level Structure
```
benny-and-blue-rsvp/
├── .claude/                    # Claude Code PM system files
│   ├── context/               # Project context documentation
│   ├── epics/                 # Epic management (archived)
│   ├── prds/                  # Product Requirements Documents
│   └── rules/                 # Development rules and guidelines
├── app/                       # Next.js App Router (main application)
├── components/                # Reusable React components
├── lib/                       # Utility functions and configurations
├── scripts/                   # Database and setup scripts
├── types/                     # TypeScript type definitions
├── public/                    # Static assets
├── .next/                     # Next.js build output (generated)
└── node_modules/              # Dependencies (generated)
```

### App Directory (Next.js App Router)
```
app/
├── globals.css                # Global styles with wedding colors
├── layout.tsx                 # Root layout component
├── page.tsx                   # Landing page (home)
├── loading.tsx                # Global loading component
├── not-found.tsx              # 404 error page
├── rsvp/
│   └── page.tsx              # RSVP form page
├── thank-you/
│   └── page.tsx              # Confirmation page
├── admin/
│   ├── layout.tsx            # Admin-specific layout
│   └── guests/
│       ├── page.tsx          # Guest management interface
│       └── loading.tsx       # Admin loading state
└── api/
    ├── rsvp/
    │   └── route.ts          # RSVP submission endpoint
    └── validate-email/
        └── route.ts          # Email validation endpoint
```

### Components Directory
```
components/
├── ui/                        # Core UI components (wedding-themed)
│   ├── button.tsx            # Button variants with wedding colors
│   ├── input.tsx             # Form input with focus states
│   ├── label.tsx             # Typography labels
│   ├── textarea.tsx          # Textarea component
│   ├── hero-image.tsx        # Hero image with fallbacks
│   ├── image-section.tsx     # Image sections with wedding theme
│   └── page-banner.tsx       # Page banners with lavender theme
├── admin/
│   └── guest-list.tsx        # Admin guest management
├── rsvp-form.tsx             # Main RSVP form component
├── rsvp-form-server.tsx      # Server-side RSVP form
├── performance-monitor.tsx    # Performance monitoring
└── lazy-performance-monitor.tsx # Lazy-loaded performance monitor
```

### Library Directory
```
lib/
├── db.ts                     # Database utilities and connections
├── actions.ts                # Next.js Server Actions
├── validations.ts            # Zod validation schemas
├── utils.ts                  # General utility functions
├── admin-utils.ts            # Admin-specific utilities
├── analytics.ts              # Analytics tracking
├── performance.ts            # Performance monitoring utilities
├── error-messages.ts         # Centralized error handling
└── __tests__/
    └── validations.test.ts   # Validation tests
```

### Scripts Directory
```
scripts/
├── init-db.ts               # Database initialization
├── test-db.ts               # Database connection testing
├── test-api.ts              # API endpoint testing
├── test-validation.ts       # Validation schema testing
└── [other utility scripts]
```

### Types Directory
```
types/
├── index.ts                 # Main type definitions
└── [additional type files]
```

## File Naming Conventions

### React Components
- **PascalCase** for component files: `HeroImage.tsx`, `GuestList.tsx`
- **kebab-case** for page files: `page.tsx`, `layout.tsx`, `loading.tsx`
- **Descriptive names** reflecting component purpose

### Utility Files
- **kebab-case** for utility files: `admin-utils.ts`, `error-messages.ts`
- **Clear functional names**: `db.ts`, `validations.ts`, `actions.ts`

### API Routes
- **RESTful conventions**: `/api/rsvp/route.ts`, `/api/validate-email/route.ts`
- **Descriptive endpoint names** reflecting action

## Module Organization

### Component Structure
```typescript
// Standard component file structure
export interface ComponentProps {
  // Props interface
}

export default function Component({ ...props }: ComponentProps) {
  // Component implementation
}
```

### Utility Module Pattern
```typescript
// Utility functions grouped by domain
export const dbUtils = {
  create: () => {},
  read: () => {},
  update: () => {},
  delete: () => {}
}
```

### Type Organization
- **Centralized types** in `types/index.ts`
- **Domain-specific interfaces**: `RSVP`, `RSVPRecord`, `ValidationResult`
- **Consistent naming**: Database records vs API format distinction

## Import/Export Patterns

### Preferred Import Style
```typescript
// Named imports for utilities
import { cn } from '@/lib/utils'
import { validateRSVP } from '@/lib/validations'

// Default imports for components
import Button from '@/components/ui/button'
import RSVPForm from '@/components/rsvp-form'
```

### Path Mapping
- **Absolute imports** using `@/` alias
- **Consistent path structure** from project root
- **Clear module boundaries** between domains

## Asset Organization

### Static Assets (`public/`)
- Images organized by purpose
- Favicon and metadata files
- Any wedding-specific imagery

### Styling Structure
- **Global styles** in `app/globals.css`
- **Component-level styling** via TailwindCSS utilities
- **Wedding color system** via CSS custom properties and Tailwind config

## Development Patterns

### File Creation Guidelines
1. **Start with types** - Define interfaces first
2. **Implement utilities** - Create helper functions
3. **Build components** - Assemble UI elements
4. **Add pages** - Wire up routing and layouts

### Code Organization Principles
- **Single responsibility** - Each file has clear purpose
- **Separation of concerns** - Database, validation, UI clearly separated
- **Consistent structure** - Follow established patterns
- **Clear dependencies** - Explicit imports and exports

This structure supports the wedding RSVP application's evolution from basic functionality to a beautifully styled, production-ready system with clear separation between concerns and excellent maintainability.
---
created: 2025-09-20T15:27:21Z
last_updated: 2025-09-20T15:27:21Z
version: 1.0
author: Claude Code PM System
---

# Project Style Guide

## Code Formatting Standards

### TypeScript/JavaScript
- **Indentation**: 2 spaces (no tabs)
- **Semicolons**: Always required
- **Quotes**: Single quotes for strings, double quotes for JSX attributes
- **Line Length**: 100 characters maximum
- **Trailing Commas**: Always in multiline objects/arrays

```typescript
// ✅ Good
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
}

// ❌ Bad
const config = {
    apiUrl: "https://api.example.com",
    timeout: 5000,
    retries: 3
};
```

### React Component Structure
```typescript
// Standard component file structure
import React from 'react'
import { ComponentProps } from './types'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline'
  size?: 'default' | 'sm' | 'lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
```

## Naming Conventions

### Files and Directories
- **Components**: PascalCase (`HeroImage.tsx`, `RSVPForm.tsx`)
- **Pages**: kebab-case (`page.tsx`, `layout.tsx`, `loading.tsx`)
- **Utilities**: kebab-case (`admin-utils.ts`, `error-messages.ts`)
- **Types**: kebab-case (`index.ts` for main types)
- **Constants**: SCREAMING_SNAKE_CASE (`API_ENDPOINTS.ts`)

### Variables and Functions
- **Variables**: camelCase (`guestCount`, `isAttending`)
- **Functions**: camelCase (`validateEmail`, `formatGuestData`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_GUESTS`, `API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`RSVPFormData`, `ValidationResult`)

### Database and API
- **Database Fields**: snake_case (`guest_count`, `created_at`)
- **API Fields**: camelCase (`guestCount`, `createdAt`)
- **Conversion**: Automatic via format converters

```typescript
// Database record (snake_case)
interface RSVPRecord {
  id: number
  guest_name: string
  email_address: string
  is_attending: boolean
  number_of_guests: number
  created_at: Date
}

// API format (camelCase)
interface RSVP {
  id: number
  guestName: string
  emailAddress: string
  isAttending: boolean
  numberOfGuests: number
  createdAt: Date
}
```

## Component Patterns

### Functional Components with Hooks
```typescript
// ✅ Preferred pattern
export default function RSVPForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<RSVPFormData>()
  
  const onSubmit = async (data: RSVPFormData) => {
    setIsSubmitting(true)
    try {
      await submitRSVP(data)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form content */}
    </form>
  )
}
```

### Props Interface Definition
```typescript
// ✅ Always define explicit interfaces
interface HeroImageProps {
  src: string
  alt: string
  priority?: boolean
  className?: string
}

export function HeroImage({ src, alt, priority = false, className }: HeroImageProps) {
  // Component implementation
}
```

### Conditional Rendering
```typescript
// ✅ Use explicit boolean checks
{errors.email && (
  <span className="text-red-500">{errors.email.message}</span>
)}

// ✅ Use ternary for simple conditions
{isSubmitting ? 'Submitting...' : 'Submit RSVP'}

// ❌ Avoid implicit boolean conversion
{errors.email?.message && (
  <span>{errors.email.message}</span>
)}
```

## Styling Guidelines

### TailwindCSS Usage
- **Utility-First**: Use Tailwind utilities directly in className
- **Component Variants**: Use `clsx` or `cn` for conditional classes
- **Custom Colors**: Use wedding color system (`wedding-dustyPink-500`)
- **Responsive**: Mobile-first approach (`sm:`, `md:`, `lg:`)

```typescript
// ✅ Good Tailwind usage
<button 
  className={cn(
    'px-4 py-2 rounded-md font-medium transition-colors',
    'bg-wedding-dustyPink-500 text-white',
    'hover:bg-wedding-dustyPink-600',
    'focus:outline-none focus:ring-2 focus:ring-wedding-dustyPink-400',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    className
  )}
>
  {children}
</button>
```

### Wedding Color System
```css
/* Use CSS custom properties for wedding colors */
:root {
  --wedding-dustyPink-50: 253 242 248;
  --wedding-dustyPink-500: 244 63 94;
  --wedding-dustyPink-900: 131 24 67;
  
  --wedding-roseGold-50: 255 251 235;
  --wedding-roseGold-500: 245 158 11;
  --wedding-roseGold-900: 146 64 14;
  
  --wedding-lavender-50: 245 243 255;
  --wedding-lavender-500: 139 92 246;
  --wedding-lavender-900: 76 29 149;
}
```

## Import/Export Patterns

### Import Organization
```typescript
// 1. React and external libraries
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// 2. Internal utilities and types
import { cn } from '@/lib/utils'
import { RSVPFormData } from '@/types'
import { validateRSVP } from '@/lib/validations'

// 3. Components (relative to current file)
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
```

### Export Patterns
```typescript
// ✅ Named exports for utilities
export const formatGuestData = (data: RSVPRecord): RSVP => {
  // Implementation
}

// ✅ Default exports for components
export default function RSVPForm() {
  // Implementation
}

// ✅ Both when needed
export const buttonVariants = cva(/* variants */)
export default Button
```

## Error Handling

### Validation Errors
```typescript
// ✅ Comprehensive error handling
export type ValidationResult<T> = {
  success: boolean
  data?: T
  errors?: {
    field?: string[]
    general?: string[]
  }
}

// Usage
export async function submitRSVP(data: unknown): Promise<ValidationResult<RSVP>> {
  try {
    const validated = RSVPSchema.parse(data)
    const result = await rsvpDb.create(validated)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: {
          field: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        }
      }
    }
    return {
      success: false,
      errors: { general: ['An unexpected error occurred'] }
    }
  }
}
```

### Component Error Boundaries
```typescript
// ✅ Graceful error handling in components
export function RSVPForm() {
  const [error, setError] = useState<string | null>(null)
  
  const handleSubmit = async (data: RSVPFormData) => {
    setError(null)
    
    try {
      const result = await submitRSVP(data)
      if (!result.success) {
        setError(result.errors?.general?.[0] || 'Submission failed')
        return
      }
      // Handle success
    } catch (error) {
      setError('An unexpected error occurred')
    }
  }
  
  return (
    <form>
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}
      {/* Form fields */}
    </form>
  )
}
```

## Database Patterns

### Query Organization
```typescript
// ✅ Organized database utilities
export const rsvpDb = {
  async create(data: RSVPCreateData): Promise<RSVPRecord> {
    const query = `
      INSERT INTO rsvp (name, email, is_attending, number_of_guests, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `
    const result = await sql.query(query, [data.name, data.email, data.isAttending, data.numberOfGuests, data.notes])
    return result.rows[0]
  },
  
  async getByEmail(email: string): Promise<RSVPRecord | null> {
    const query = 'SELECT * FROM rsvp WHERE email = $1'
    const result = await sql.query(query, [email])
    return result.rows[0] || null
  },
  
  async getAll(): Promise<RSVPRecord[]> {
    const query = 'SELECT * FROM rsvp ORDER BY created_at DESC'
    const result = await sql.query(query)
    return result.rows
  }
}
```

## Testing Patterns

### Validation Testing
```typescript
// ✅ Comprehensive validation testing
import { describe, it, expect } from 'vitest'
import { RSVPSchema } from '../validations'

describe('RSVP Validation', () => {
  it('should validate correct RSVP data', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      isAttending: true,
      numberOfGuests: 2
    }
    
    expect(() => RSVPSchema.parse(validData)).not.toThrow()
  })
  
  it('should reject invalid email', () => {
    const invalidData = {
      name: 'John Doe',
      email: 'invalid-email',
      isAttending: true,
      numberOfGuests: 1
    }
    
    expect(() => RSVPSchema.parse(invalidData)).toThrow()
  })
})
```

## Documentation Standards

### Component Documentation
```typescript
/**
 * RSVP form component for collecting guest responses
 * 
 * Features:
 * - Real-time validation with Zod
 * - Email uniqueness checking
 * - Mobile-optimized design
 * - Progressive enhancement
 * 
 * @example
 * <RSVPForm onSuccess={() => router.push('/thank-you')} />
 */
export default function RSVPForm({ onSuccess }: RSVPFormProps) {
  // Implementation
}
```

### Function Documentation
```typescript
/**
 * Validates and submits RSVP data to the database
 * 
 * @param data - Raw form data to validate and submit
 * @returns Promise resolving to validation result with success status
 * 
 * @example
 * const result = await submitRSVP(formData)
 * if (result.success) {
 *   console.log('RSVP submitted:', result.data)
 * } else {
 *   console.error('Validation errors:', result.errors)
 * }
 */
export async function submitRSVP(data: unknown): Promise<ValidationResult<RSVP>> {
  // Implementation
}
```

This style guide ensures consistent, maintainable, and professional code throughout the wedding RSVP application while following modern React and TypeScript best practices.
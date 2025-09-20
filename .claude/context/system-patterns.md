---
created: 2025-09-20T15:27:21Z
last_updated: 2025-09-20T15:27:21Z
version: 1.0
author: Claude Code PM System
---

# System Patterns

## Architectural Style

### Server-Side Architecture
- **Pattern**: Next.js App Router with Server Actions
- **Rendering**: Server-side rendering (SSR) with streaming
- **Data Flow**: Server Actions → Database → Components
- **State Management**: Server-driven with progressive enhancement

### Component Architecture
- **Pattern**: Functional components with hooks
- **Composition**: Atomic design principles (atoms → molecules → organisms)
- **Styling**: Utility-first with TailwindCSS
- **Props**: TypeScript interfaces for type safety

## Data Flow Patterns

### Form Submission Pattern
```
User Input → React Hook Form → Zod Validation → Server Action → Database → Response
```

**Implementation:**
- Client-side validation for immediate feedback
- Server-side validation for security
- Progressive enhancement (works without JavaScript)
- Dual-layer validation using shared Zod schemas

### Database Access Pattern
```
Server Action → Database Utility → SQL Query → Format Conversion → Response
```

**Key Features:**
- Abstraction layer for database operations
- Automatic format conversion (snake_case ↔ camelCase)
- Parameterized queries for security
- Connection pooling via Neon

## Design Patterns

### Database Abstraction Layer
```typescript
// Pattern: Utility functions with format conversion
export const rsvpDb = {
  create: (data: RSVPCreateData) => RSVPRecord,
  getByEmail: (email: string) => RSVPRecord | null,
  getAll: () => RSVPRecord[]
}
```

### Validation Strategy
```typescript
// Pattern: Shared schemas across client/server
const RSVPSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  // ... other fields
})

// Client: React Hook Form
const form = useForm<RSVPFormData>({
  resolver: zodResolver(RSVPSchema)
})

// Server: Same schema for validation
export async function submitRSVP(data: unknown) {
  const validated = RSVPSchema.parse(data)
  // ... process validated data
}
```

### Component Composition Pattern
```typescript
// Pattern: Compound components with forwarded props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline'
  size?: 'default' | 'sm' | 'lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

## State Management Patterns

### Server State Pattern
- **Primary Pattern**: Server Actions with database persistence
- **Benefits**: Reduced client-side complexity, SEO-friendly
- **Implementation**: Form submissions trigger server mutations
- **Caching**: Next.js built-in request caching

### Client State Pattern
- **Form State**: React Hook Form for form management
- **UI State**: React useState for component-local state
- **Global State**: Minimal - leveraging server state where possible
- **Performance**: Lazy loading for non-critical components

## Error Handling Patterns

### Validation Error Pattern
```typescript
// Pattern: Comprehensive error handling with user feedback
export type ValidationResult<T> = {
  success: boolean
  data?: T
  errors?: {
    field?: string[]
    general?: string[]
  }
}
```

### Progressive Enhancement Pattern
```typescript
// Pattern: Graceful degradation for JavaScript failures
export function RSVPForm() {
  // Works as HTML form without JavaScript
  return (
    <form action="/api/rsvp" method="POST">
      {/* Enhanced with JavaScript when available */}
      <EnhancedFormFields />
    </form>
  )
}
```

## Security Patterns

### Input Validation Pattern
- **Client-side**: Immediate feedback with React Hook Form
- **Server-side**: Security validation with Zod schemas
- **Database**: Parameterized queries via @vercel/postgres
- **Type Safety**: Full TypeScript coverage

### Authentication Pattern (Admin)
- **Approach**: Simplified admin access
- **Protection**: Environment-based configuration
- **Session**: Stateless with secure cookies
- **Authorization**: Role-based access control

## Performance Patterns

### Image Optimization Pattern
```typescript
// Pattern: Next.js Image with fallbacks
export function HeroImage({ src, alt }: ImageProps) {
  return (
    <div className="relative">
      <Image
        src={src}
        alt={alt}
        fill
        priority
        className="object-cover"
        fallback={<GradientFallback />}
      />
    </div>
  )
}
```

### Code Splitting Pattern
- **Route-based**: Automatic with Next.js App Router
- **Component-based**: Lazy loading with React.lazy()
- **Bundle Analysis**: webpack-bundle-analyzer integration
- **Critical Path**: Inline critical CSS and JavaScript

## Styling Patterns

### Wedding Color System Pattern
```css
/* Pattern: CSS custom properties + TailwindCSS utilities */
:root {
  --wedding-dustyPink-500: 244 63 94;
  --wedding-roseGold-500: 245 158 11;
  --wedding-lavender-500: 139 92 246;
}

/* Usage in components */
.btn-primary {
  @apply bg-wedding-dustyPink-500 text-white;
}
```

### Component Variant Pattern
```typescript
// Pattern: Consistent styling with cva (class-variance-authority)
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-wedding-dustyPink-500 text-white",
        outline: "border border-wedding-dustyPink-300",
        secondary: "bg-wedding-roseGold-100"
      }
    }
  }
)
```

## Testing Patterns

### Integration Testing Pattern
- **Database**: Test with actual database connections
- **API**: End-to-end API route testing
- **Validation**: Comprehensive schema testing
- **Components**: Testing Library for React components

### Type Safety Pattern
- **Interfaces**: Comprehensive TypeScript interfaces
- **Runtime Validation**: Zod for runtime type checking
- **API Contracts**: Shared types between client/server
- **Error Prevention**: Compile-time error catching

## Deployment Patterns

### Environment Configuration Pattern
```typescript
// Pattern: Environment-specific configuration
const config = {
  database: {
    url: process.env.POSTGRES_URL!,
    pooled: process.env.POSTGRES_PRISMA_URL!
  },
  auth: {
    secret: process.env.NEXTAUTH_SECRET!,
    url: process.env.NEXTAUTH_URL!
  }
}
```

### Build Optimization Pattern
- **Static Generation**: Pre-render static pages
- **Incremental Regeneration**: Update static content
- **Bundle Splitting**: Optimize JavaScript bundles
- **Asset Optimization**: Compress images and fonts

These patterns provide a consistent, maintainable foundation for the wedding RSVP application while ensuring excellent performance, security, and developer experience.
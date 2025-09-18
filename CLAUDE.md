# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a wedding RSVP web application built with Next.js 14+ App Router, TypeScript, PostgreSQL (Neon), and deployed on Vercel. The application follows a clean architecture with strict separation of concerns between validation, database operations, and UI components.

## Development Commands

```bash
# Development
npm run dev              # Start development server (localhost:3000)
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking

# Database Operations
npm run db:init         # Initialize database tables
npm run db:test         # Test database connection
```

## Architecture Overview

### Core Data Flow
1. **Form Validation**: Client-side (React Hook Form + Zod) → Server-side (Zod schemas)
2. **Database Operations**: Server Actions → Database utilities → PostgreSQL (Neon)
3. **Type Safety**: Database records (snake_case) ↔ API format (camelCase) via format converters

### Key Architectural Patterns

**Server Actions Pattern**: Uses Next.js 14 Server Actions instead of API routes for form submissions
- Location: `lib/actions.ts`
- Functions: `submitRSVPAndRedirect`, `validateEmailAvailability`
- Benefits: Progressive enhancement, simplified data flow

**Database Abstraction Layer**:
- **File**: `lib/db.ts`
- **Pattern**: Utility functions that wrap @vercel/postgres
- **Format Conversion**: Automatic snake_case ↔ camelCase transformation
- **Functions**: `rsvpDb.create()`, `rsvpDb.getByEmail()`, `rsvpDb.getAll()`

**Validation Strategy**: Dual-layer validation with shared schemas
- **Client**: React Hook Form with Zod resolver for real-time feedback
- **Server**: Same Zod schemas for security and data integrity
- **Schema Location**: `lib/validations.ts`

## Critical File Relationships

### Validation Chain
```
lib/validations.ts (Zod schemas)
├── components/rsvp-form.tsx (client validation)
├── lib/actions.ts (server validation)
└── app/api/*/route.ts (API validation)
```

### Database Layer
```
lib/db.ts (utilities) → types/index.ts (interfaces)
├── RSVPRecord (database format, snake_case)
├── RSVP (API format, camelCase)
└── formatConverters.dbToApi() / apiToDb()
```

### Form Flow
```
components/rsvp-form.tsx → lib/actions.ts → lib/db.ts → PostgreSQL
                     ↘ app/thank-you (redirect on success)
```

## Environment Configuration

**Required Variables** (see .env.example):
- `POSTGRES_URL` - Main database connection
- `POSTGRES_PRISMA_URL` - Pooled connection
- `POSTGRES_URL_NON_POOLING` - Direct connection
- `NEXTAUTH_SECRET` - Auth encryption key
- `NEXTAUTH_URL` - Production domain

**Development Setup**:
```bash
cp .env.example .env.local
npm run db:init    # Only run once
npm run db:test    # Verify connection
```

## Database Schema

**RSVP Table** (`scripts/init-db.ts`):
```sql
CREATE TABLE rsvp (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  is_attending BOOLEAN NOT NULL DEFAULT false,
  number_of_guests INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Component Architecture

**Page Components**:
- `app/page.tsx` - Landing page with wedding info
- `app/rsvp/page.tsx` - RSVP form page
- `app/thank-you/page.tsx` - Confirmation page

**Form Components**:
- `components/rsvp-form.tsx` - Client-side React Hook Form
- `components/rsvp-form-server.tsx` - Server Actions form

**UI Components**: Located in `components/ui/` (button, input, label, textarea)

## Type System

**Database Types** (`types/index.ts`):
- `RSVPRecord` - Raw database record (snake_case fields)
- `RSVP` - API response format (camelCase fields)
- `RSVPCreateData` - For new RSVP creation
- `RSVPUpdateData` - For partial updates

**Form Types**:
- `RSVPFormData` - Form submission data
- `ValidationResult<T>` - Server validation response

## Deployment

**Vercel Configuration** (`vercel.json`):
- Optimized for Next.js 14+ App Router
- 30-second function timeout
- Environment variable mapping

**Build Process**:
1. TypeScript compilation
2. Next.js optimization
3. Static page generation
4. API route bundling

## Testing Strategy

**Manual Testing Scripts**:
- `scripts/test-db.ts` - Database connectivity
- `scripts/test-api.ts` - API endpoint testing
- `scripts/test-validation.ts` - Validation schema testing

**Quality Gates**:
- TypeScript: Zero compilation errors
- ESLint: Clean code standards
- Build: Successful production build

## Common Development Tasks

**Adding New Form Fields**:
1. Update Zod schema in `lib/validations.ts`
2. Add database column in `scripts/init-db.ts`
3. Update TypeScript interfaces in `types/index.ts`
4. Modify form component in `components/rsvp-form.tsx`

**Database Operations**:
- Always use utilities in `lib/db.ts`
- Format conversion is automatic via `formatConverters`
- Test changes with `npm run db:test`

**API Routes**:
- Use Server Actions when possible (`lib/actions.ts`)
- API routes in `app/api/` for external integrations only
- Always validate input with Zod schemas
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wedding RSVP web application built with Next.js 15 App Router, TypeScript, PostgreSQL (Neon), and Resend for emails. Deployed on Vercel with automatic GitHub integration.

## Development Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build           # Production build
npm run start           # Start production server
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking

# Database
npm run db:init         # Initialize database tables (run once)
npm run db:test         # Test database connection
```

## Architecture Overview

### Core Data Flow
1. **Form Validation**: Client-side (React Hook Form + Zod) → Server-side (Zod schemas)
2. **Database Operations**: Server Actions → Database utilities → PostgreSQL (Neon)
3. **Type Safety**: Database records (snake_case) ↔ API format (camelCase) via format converters
4. **Email Notifications**: RSVP submission → `@react-email/render` → Resend API

### Key Architectural Patterns

**Server Actions Pattern** (`lib/actions.ts`):
- Primary method for form submissions (not API routes)
- Functions: `submitRSVP`, `submitRSVPAndRedirect`, `deleteRSVP`, `validateEmailUniqueness`
- Benefits: Progressive enhancement, automatic revalidation

**Database Abstraction Layer** (`lib/db.ts`):
- Wraps `@vercel/postgres` with utility functions
- Automatic format conversion: snake_case (DB) ↔ camelCase (API)
- Performance monitoring via `lib/performance.ts`
- Key functions: `rsvpDb.create()`, `rsvpDb.getByEmail()`, `rsvpDb.getAll()`, `rsvpDb.delete()`, `rsvpDb.getStats()`

**Validation Strategy** (`lib/validations.ts`):
- Shared Zod schemas for client and server validation
- Client: React Hook Form with Zod resolver
- Server: Same schemas ensure security and consistency

**Email System** (`lib/email.ts`):
- Uses `@react-email/render` to convert React components to HTML
- Sends via Resend API (gracefully degrades if RESEND_API_KEY not configured)
- Template: `emails/rsvp-confirmation.tsx`
- Important: Must use `render()` to avoid "b is not a function" errors in production

### Critical Configuration

**Next.js Config** (`next.config.js`):
```javascript
transpilePackages: ['@react-email/components', '@react-email/render']
```
This prevents bundling issues with email templates.

## Database Schema

```sql
CREATE TABLE rsvp (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  is_attending BOOLEAN NOT NULL DEFAULT false,
  number_of_guests INTEGER NOT NULL DEFAULT 1 CHECK (number_of_guests >= 0),
  guest_names JSONB DEFAULT NULL,
  dietary_restrictions TEXT,
  song_requests TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Key Indexes**:
- `idx_rsvp_email` - Email lookups
- `idx_rsvp_attendance` - Stats queries
- `idx_rsvp_attendance_guests` - Composite for common patterns

**Triggers**:
- `update_rsvp_updated_at` - Auto-updates `updated_at` timestamp

## Type System

**Three-Layer Type System** (`types/index.ts`):
1. **RSVPRecord** - Raw database format (snake_case)
2. **RSVPCreateData/RSVPUpdateData** - Input format (camelCase)
3. **RSVP** - API response format (camelCase)

**Format Converters** (`lib/db.ts`):
- `formatConverters.dbToApi()` - Converts RSVPRecord → RSVP
- `formatConverters.apiToDb()` - Converts CreateData/UpdateData → DB format
- Handles JSONB serialization for `guest_names` array

## Critical File Relationships

```
Validation Chain:
lib/validations.ts (Zod schemas)
├── components/rsvp-form.tsx (client)
├── lib/actions.ts (server)
└── app/api/*/route.ts (API endpoints)

Database Layer:
lib/db.ts → types/index.ts
├── RSVPRecord (snake_case, database)
├── RSVP (camelCase, API)
└── formatConverters

Email Flow:
lib/actions.ts → lib/email.ts → @react-email/render → Resend API
                                → emails/rsvp-confirmation.tsx
```

## Environment Variables

**Required** (see `.env.example`):
- `POSTGRES_URL` - Main database connection
- `POSTGRES_PRISMA_URL` - Pooled connection
- `POSTGRES_URL_NON_POOLING` - Direct connection
- `NEXTAUTH_SECRET` - Auth encryption key (32+ chars)
- `NEXTAUTH_URL` - Production domain
- `RESEND_API_KEY` - Email service API key (optional, degrades gracefully)

**Application Settings**:
- `APP_URL` - Same as NEXTAUTH_URL
- `WEDDING_DATE` - Format: YYYY-MM-DD
- `RSVP_DEADLINE` - Format: YYYY-MM-DD

**Setup**:
```bash
cp .env.example .env.local
npm run db:init    # Only run once
npm run db:test    # Verify connection
```

## Admin Dashboard

Located at `/admin` with subroutes:
- `/admin` - Dashboard overview with stats
- `/admin/guests` - Full guest list with delete functionality
- `/admin/dietary` - Dietary restrictions view
- `/admin/songs` - Song requests view

**Delete Functionality** (`components/admin/delete-rsvp-button.tsx`):
- Client component with inline confirmation
- Calls `deleteRSVP()` server action
- Auto-revalidates all admin pages

## Component Architecture

**Pages**:
- `app/page.tsx` - Landing page with wedding info, venue address
- `app/rsvp/page.tsx` - RSVP form page
- `app/thank-you/page.tsx` - Confirmation page
- `app/travel/page.tsx` - Travel and accommodations
- `app/admin/**` - Admin dashboard and views

**Form Components**:
- `components/rsvp-form.tsx` - Client-side React Hook Form with Zod validation
- Dynamic guest name fields based on `numberOfGuests`
- Real-time validation feedback

**Admin Components**:
- `components/admin/rsvp-card.tsx` - Individual RSVP card with delete button
- `components/admin/delete-rsvp-button.tsx` - Confirmation dialog for deletion
- `components/admin/test-email-button.tsx` - Test email functionality

## Styling System

**Tailwind Configuration** (`tailwind.config.js`):
- Custom wedding color palette:
  - `wedding-dustyPink` - Primary accent
  - `wedding-lavender` - Secondary accent
  - `wedding-roseGold` - CTA and links
  - `wedding-cream` - Brunch card background

**Important**: Brunch card uses `bg-wedding-cream-200` and `border-wedding-cream-400` for better visibility against the background.

## Common Development Tasks

### Adding New Form Fields
1. Update Zod schema in `lib/validations.ts`
2. Add database column in `scripts/init-db.ts` and run migration
3. Update TypeScript interfaces in `types/index.ts`
4. Update format converters in `lib/db.ts` if needed
5. Modify form component in `components/rsvp-form.tsx`

### Database Operations
- Always use utilities in `lib/db.ts`
- Format conversion is automatic via `formatConverters`
- Test changes with `npm run db:test`
- Never use raw SQL unless absolutely necessary

### Email Template Changes
1. Edit `emails/rsvp-confirmation.tsx`
2. Test locally with test email button at `/admin`
3. Remember: Must use `render()` in `lib/email.ts` to avoid production errors

### Deployment
- Push to `main` branch triggers automatic Vercel deployment
- Vercel auto-detects Next.js and applies optimizations
- Check build logs at vercel.com dashboard
- Clear build cache if configuration changes don't take effect

## Agent Usage Guidelines (from .claude/CLAUDE.md)

### Sub-Agent Best Practices
1. **file-analyzer**: Use for reading verbose log files and extracting key information
2. **code-analyzer**: Use for searching code, analyzing logic flow, and finding bugs
3. **test-runner**: Use for executing tests and analyzing results

### Development Philosophy
- Think carefully and implement concise solutions that change minimal code
- No partial implementations or simplifications
- No code duplication - reuse existing functions
- No dead code - use it or delete it
- Implement tests for new functions
- No over-engineering - prefer simple, working solutions
- Proper separation of concerns - no mixed responsibilities
- Clean up resources - close connections, clear timeouts, remove listeners

### Tone and Behavior
- Be concise and direct
- Criticism and skepticism are welcome
- Ask questions rather than guessing intent
- Avoid flattery unless specifically asked for judgment

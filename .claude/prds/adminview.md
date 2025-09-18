---
name: adminview
description: Basic admin view for wedding RSVP submissions with guest management and attendance tracking
status: backlog
created: 2025-09-18T21:39:33Z
---

# PRD: Admin View for Wedding RSVP Management

## Executive Summary

**CCPM PRD #3** introduces a basic administrative interface for viewing and managing wedding RSVP submissions. This server-side rendered admin panel will provide wedding hosts with comprehensive visibility into guest responses, attendance numbers, and guest details without requiring authentication in the initial implementation.

**Value Proposition**: Enable wedding hosts to efficiently track RSVP responses, monitor attendance counts, and access guest information for planning purposes through a clean, organized interface.

## Problem Statement

### Current State
The wedding RSVP application successfully collects guest responses with dynamic guest management (completed in Epic #2), but currently provides no way for wedding hosts to:
- View submitted RSVP responses
- Track attendance numbers and guest counts
- Access guest names and special notes
- Monitor submission trends over time

### Why This Matters Now
- RSVPs are being submitted but remain invisible to hosts
- Wedding planning requires accurate headcounts for venue, catering, and seating
- Guest information needs to be accessible for coordination with vendors
- Timeline pressure as wedding date approaches requires efficient guest management

### Impact of Inaction
- Manual database queries required to check RSVPs
- Inability to track response rates and plan accordingly
- Risk of missing important guest notes or dietary requirements
- Inefficient wedding planning process

## User Stories

### Primary User: Wedding Hosts (Benny & Blue)

**Story 1: RSVP Overview**
- **As a** wedding host
- **I want to** view all RSVP submissions in one place
- **So that** I can track response rates and plan accordingly
- **Acceptance Criteria:**
  - All RSVP entries displayed in chronological order (newest first)
  - Clear visual distinction between attending and non-attending guests
  - Quick scan of essential information without scrolling horizontally

**Story 2: Guest Details Access**
- **As a** wedding host
- **I want to** see guest names and special notes for each RSVP
- **So that** I can coordinate with vendors and address special requirements
- **Acceptance Criteria:**
  - Guest names clearly listed for each attending RSVP
  - Special notes/comments visible when provided
  - Contact information (email) accessible for follow-up if needed

**Story 3: Attendance Tracking**
- **As a** wedding host
- **I want to** see total attendance numbers and guest counts
- **So that** I can provide accurate headcounts to venue and caterers
- **Acceptance Criteria:**
  - Summary showing total RSVPs received
  - Count of guests attending vs. not attending
  - Total guest count including +1s and additional guests

### Secondary User: Future Wedding Planners/Family

**Story 4: Planning Support**
- **As a** family member helping with wedding planning
- **I want to** access guest information through a simple URL
- **So that** I can assist with coordination without complex login processes
- **Acceptance Criteria:**
  - Direct URL access to admin interface
  - No authentication barriers in initial version
  - Clear, intuitive layout for non-technical users

## Requirements

### Functional Requirements

**Core Display Features**
- **FR-1**: Create `/admin/guests` route using Next.js App Router
- **FR-2**: Server-side rendering for optimal performance and SEO
- **FR-3**: Query all RSVP entries from Neon PostgreSQL database
- **FR-4**: Sort entries by `created_at DESC` (newest first)
- **FR-5**: Display comprehensive RSVP information per entry:
  - Name (prominently displayed/bold)
  - Email address
  - Attending status (Yes/No with visual indicators)
  - Number of guests
  - Guest names list (when applicable)
  - Special notes/comments (when provided)
  - Submission timestamp (formatted for readability)

**Visual Organization**
- **FR-6**: Clear visual distinction between attending and non-attending guests
- **FR-7**: Card or table-style layout for easy scanning
- **FR-8**: Status badges ("✅ Attending" / "❌ Not Attending")
- **FR-9**: Responsive design for desktop and mobile viewing

**Summary Analytics**
- **FR-10**: Summary footer with key metrics:
  - Total RSVP submissions received
  - Total guests attending (Yes responses)
  - Total guest count including additional guests
  - Response rate indicator (if invitation count known)

### Non-Functional Requirements

**Performance**
- **NFR-1**: Page load time under 2 seconds
- **NFR-2**: Efficient database queries with proper indexing
- **NFR-3**: Server-side rendering for immediate content visibility

**Security (Initial Implementation)**
- **NFR-4**: URL-based access only (no public navigation links)
- **NFR-5**: Code comments indicating future authentication integration points
- **NFR-6**: No sensitive data logging in admin interface

**Usability**
- **NFR-7**: Clean, intuitive interface requiring no training
- **NFR-8**: Mobile-responsive design for on-the-go access
- **NFR-9**: Fast visual scanning of guest information

**Technical Architecture**
- **NFR-10**: Built with Next.js 14+ App Router server components
- **NFR-11**: TypeScript strict mode compliance
- **NFR-12**: Integration with existing Neon PostgreSQL database
- **NFR-13**: Consistent styling with existing application

## Success Criteria

### Immediate Success Metrics
- **SC-1**: Admin interface accessible at `/admin/guests` within 1 week
- **SC-2**: All RSVP data accurately displayed and up-to-date
- **SC-3**: Page loads under 2 seconds consistently
- **SC-4**: Mobile-responsive interface works on all major devices

### User Experience Metrics
- **SC-5**: Wedding hosts can locate specific RSVP within 10 seconds
- **SC-6**: Attendance summary visible without scrolling
- **SC-7**: Guest information readable without horizontal scrolling on mobile

### Technical Success Metrics
- **SC-8**: Zero database query errors in production
- **SC-9**: TypeScript compilation with zero errors
- **SC-10**: Server-side rendering functioning correctly
- **SC-11**: Integration with existing database schema without modifications

## Constraints & Assumptions

### Technical Constraints
- **TC-1**: Must use existing Neon PostgreSQL database without schema changes
- **TC-2**: Built within Next.js 14+ App Router architecture
- **TC-3**: Server-side rendering required (no client-side data fetching for main content)
- **TC-4**: TypeScript strict mode compliance mandatory

### Timeline Constraints
- **TLC-1**: Initial version needed within 1-2 weeks for wedding planning
- **TLC-2**: No time for complex authentication implementation initially
- **TLC-3**: Minimal UI polish acceptable for functional MVP

### Resource Constraints
- **RC-1**: Single developer (Ben) implementation
- **RC-2**: No additional database costs (use existing Neon free tier)
- **RC-3**: No third-party service integrations required

### Key Assumptions
- **A-1**: Direct URL access provides sufficient security for initial launch
- **A-2**: Existing database has sufficient RSVP data for meaningful testing
- **A-3**: Wedding hosts comfortable with basic web interface navigation
- **A-4**: Guest privacy acceptable with admin access to their information

## Out of Scope

### Explicitly NOT Included
- **OOS-1**: User authentication/login system (reserved for future PRD)
- **OOS-2**: RSVP editing or deletion capabilities
- **OOS-3**: Email communication features
- **OOS-4**: Advanced filtering or search functionality
- **OOS-5**: Data export features (CSV, PDF, etc.)
- **OOS-6**: Guest check-in or day-of-wedding functionality
- **OOS-7**: Integration with wedding planning tools or vendor platforms
- **OOS-8**: Real-time updates or notifications
- **OOS-9**: Audit logs or change tracking
- **OOS-10**: Multi-user access controls or permissions

### Future Considerations
- Authentication system (PRD #4 candidate)
- Advanced admin features (editing, bulk operations)
- Guest communication tools
- Vendor coordination features

## Dependencies

### External Dependencies
- **ED-1**: Neon PostgreSQL database availability and performance
- **ED-2**: Vercel hosting platform for deployment
- **ED-3**: Next.js framework stability and App Router functionality

### Internal Dependencies
- **ID-1**: Completed RSVP functionality (Epic #2) with guest names database schema
- **ID-2**: Existing database utilities and format converters from Epic #2
- **ID-3**: Current TypeScript interfaces for RSVP data structure
- **ID-4**: Existing application styling and component patterns

### Data Dependencies
- **DD-1**: RSVP submissions in production database for realistic testing
- **DD-2**: Guest names stored in JSONB format as implemented in Epic #2
- **DD-3**: Consistent data format from existing form submissions

## Technical Architecture

### Route Implementation
- **Path**: `/admin/guests`
- **Type**: Server Component (Next.js App Router)
- **Data Source**: Direct Neon PostgreSQL queries

### Database Integration
- **Schema**: Existing `rsvps` table with JSONB guest names
- **Query Pattern**: `SELECT * FROM rsvps ORDER BY created_at DESC`
- **Format Conversion**: Use existing `formatConverters.dbToApi()`

### Component Structure
```
app/admin/guests/page.tsx (Server Component)
├── Database query and data formatting
├── RSVP card/row components
├── Summary statistics calculation
└── Response rendering
```

### Styling Approach
- Consistent with existing application design
- Tailwind CSS or component-level styling
- Mobile-first responsive design
- Clear visual hierarchy for easy scanning

## Implementation Notes

### Authentication Placeholder
```typescript
// TODO: Future PRD - Add authentication middleware
// This route should be protected once auth system is implemented
// Consider: simple password protection or OAuth integration
```

### Performance Considerations
- Server-side rendering for SEO and performance
- Efficient database queries with appropriate indexes
- Minimal client-side JavaScript for fast loading

### Error Handling
- Graceful handling of database connection issues
- Clear error messages for debugging
- Fallback UI for empty or loading states

## Risk Mitigation

### Technical Risks
- **Risk**: Database performance with large RSVP volumes
- **Mitigation**: Implement pagination if needed, monitor query performance

- **Risk**: URL discovery by unauthorized users
- **Mitigation**: Obscure URL path, monitor access logs, plan authentication for next iteration

### User Experience Risks
- **Risk**: Information overload with large guest lists
- **Mitigation**: Clear visual hierarchy, summary statistics prominently displayed

- **Risk**: Mobile usability challenges
- **Mitigation**: Mobile-first design approach, test on multiple devices

## Future Evolution

This PRD establishes the foundation for a comprehensive wedding admin system. Future enhancements may include:

1. **Authentication & Security** (PRD #4 candidate)
2. **Advanced Admin Features** (editing, bulk operations)
3. **Guest Communication Tools** (email updates, reminders)
4. **Vendor Coordination** (headcount exports, dietary summaries)
5. **Real-time Analytics** (response rate tracking, timeline views)

The current implementation provides immediate value while maintaining architectural flexibility for these future capabilities.
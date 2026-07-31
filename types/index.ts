// Core types for the wedding RSVP application

// Database RSVP record (matches database schema)
export interface RSVPRecord {
  id: number;
  name: string;
  email: string;
  is_attending: boolean;
  number_of_guests: number;
  guest_names: string[] | null;
  dietary_restrictions: string | null;
  song_requests: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

// RSVP data for creating new entries (input format)
export interface RSVPCreateData {
  name: string;
  email: string;
  isAttending: boolean;
  numberOfGuests: number;
  guestNames: string[];
  dietaryRestrictions?: string;
  songRequests?: string;
  notes?: string;
}

// RSVP data for updates (partial input format)
export interface RSVPUpdateData {
  name?: string;
  email?: string;
  isAttending?: boolean;
  numberOfGuests?: number;
  guestNames?: string[];
  dietaryRestrictions?: string;
  songRequests?: string;
  notes?: string;
}

// RSVP data for API responses (camelCase format)
export interface RSVP {
  id: number;
  name: string;
  email: string;
  isAttending: boolean;
  numberOfGuests: number;
  guestNames: string[] | null;
  dietaryRestrictions: string | null;
  songRequests: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// RSVP statistics
export interface RSVPStats {
  total_responses: number;
  attending_count: number;
  not_attending_count: number;
  total_guests: number;
}

// Admin-specific data structure with analytics
export interface AdminRSVPData {
  rsvps: RSVP[];
  analytics: {
    totalResponses: number;
    attendingCount: number;
    notAttendingCount: number;
    totalGuests: number;
    attendanceRate: number;
    averageGuestsPerRSVP: number;
    recentSubmissions: number; // Last 24 hours
  };
  performance: {
    queryTime: number;
    recordCount: number;
  };
}

// Enhanced admin statistics with detailed breakdown
export interface AdminRSVPStats extends RSVPStats {
  attendance_rate: number;
  average_guests_per_rsvp: number;
  recent_submissions_24h: number;
  guest_breakdown: {
    solo_attendees: number;
    couples: number;
    families: number; // 3+ guests
  };
  submission_timeline: {
    last_7_days: number;
    last_30_days: number;
    older: number;
  };
}

// ---------------------------------------------------------------------------
// Seating chart
// ---------------------------------------------------------------------------

// Database record for a seating table (snake_case)
export interface SeatingTableRecord {
  id: number;
  name: string;
  capacity: number;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

// Seating table in API format (camelCase)
export interface SeatingTable {
  id: number;
  name: string;
  capacity: number;
  sortOrder: number;
}

// Database record for a single person's table assignment (snake_case)
export interface SeatingAssignmentRecord {
  person_id: string;
  rsvp_id: number;
  seat_index: number;
  table_id: number;
}

// personId -> tableId. The working format used by the planner UI.
export type SeatingAssignmentMap = Record<string, number>;

// A single attendee derived from an RSVP: either the person who submitted it
// (seatIndex 0) or one of their plus-ones (seatIndex 1..numberOfGuests).
export interface SeatingPerson {
  personId: string;
  rsvpId: number;
  seatIndex: number;
  name: string;
  isPrimary: boolean;
  // false when the plus-one was never named and we show a placeholder
  isNamed: boolean;
  partyName: string;
  dietaryRestrictions: string | null;
}

// Everyone from one RSVP, kept together so parties can be seated as a unit
export interface SeatingParty {
  rsvpId: number;
  name: string;
  email: string;
  size: number;
  people: SeatingPerson[];
  dietaryRestrictions: string | null;
  notes: string | null;
}

export interface SeatingTableWithPeople extends SeatingTable {
  people: SeatingPerson[];
  seatsUsed: number;
  seatsLeft: number;
  isOverCapacity: boolean;
  partyCount: number;
}

export interface SeatingPlan {
  tables: SeatingTableWithPeople[];
  // Parties with at least one unseated person; `people` holds only the
  // unseated members, while `size` remains the full party size.
  unseatedParties: SeatingParty[];
  totalAttendees: number;
  seatedCount: number;
  unseatedCount: number;
  totalCapacity: number;
}

// Legacy Guest interface (kept for compatibility)
export interface Guest {
  id: string;
  name: string;
  email: string;
  attending: boolean | null;
  dietaryRestrictions?: string;
  plusOne?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseConnection {
  connectionString: string;
}
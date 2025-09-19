// Core types for the wedding RSVP application

// Database RSVP record (matches database schema)
export interface RSVPRecord {
  id: number;
  name: string;
  email: string;
  is_attending: boolean;
  number_of_guests: number;
  guest_names: string[] | null;
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
  notes?: string;
}

// RSVP data for updates (partial input format)
export interface RSVPUpdateData {
  name?: string;
  isAttending?: boolean;
  numberOfGuests?: number;
  guestNames?: string[];
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
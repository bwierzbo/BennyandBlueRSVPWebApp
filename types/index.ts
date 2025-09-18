// Core types for the wedding RSVP application

// Database RSVP record (matches database schema)
export interface RSVPRecord {
  id: number;
  name: string;
  email: string;
  is_attending: boolean;
  number_of_guests: number;
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
  notes?: string;
}

// RSVP data for updates (partial input format)
export interface RSVPUpdateData {
  name?: string;
  isAttending?: boolean;
  numberOfGuests?: number;
  notes?: string;
}

// RSVP data for API responses (camelCase format)
export interface RSVP {
  id: number;
  name: string;
  email: string;
  isAttending: boolean;
  numberOfGuests: number;
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
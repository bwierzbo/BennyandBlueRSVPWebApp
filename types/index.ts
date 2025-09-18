// Core types for the wedding RSVP application

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

export interface RSVP {
  id: string;
  guestId: string;
  attending: boolean;
  message?: string;
  submittedAt: Date;
}

export interface DatabaseConnection {
  connectionString: string;
}
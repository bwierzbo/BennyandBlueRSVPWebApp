import { z } from "zod";

// Base validation schemas for reusability
const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .max(254, "Email must be 254 characters or less"); // RFC 5321 limit

const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must be 100 characters or less")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes");

const attendanceSchema = z.enum(["yes", "no"], {
  required_error: "Please select your attendance status",
  invalid_type_error: "Attendance must be 'yes' or 'no'",
});

// Guest name validation schema
const guestNameSchema = z
  .string()
  .min(1, "Guest name is required")
  .max(100, "Guest name must be 100 characters or less")
  .regex(/^[a-zA-Z0-9\s'-]+$/, "Guest name can only contain letters, numbers, spaces, hyphens, and apostrophes");

// RSVP Form Schema with conditional guest validation
export const rsvpFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  attendance: attendanceSchema,
  numberOfGuests: z
    .number()
    .int("Number of guests must be a whole number")
    .min(0, "Number of guests cannot be negative")
    .max(10, "Maximum 10 guests allowed")
    .optional()
    .default(0),
  guestNames: z
    .array(guestNameSchema)
    .max(10, "Maximum 10 guest names allowed")
    .optional()
    .default([]),
  dietaryRestrictions: z
    .string()
    .max(500, "Dietary restrictions must be 500 characters or less")
    .optional(),
  notes: z
    .string()
    .max(1000, "Notes must be 1000 characters or less")
    .optional(),
}).refine((data) => {
  // When attending with guests, guest names must be provided
  if (data.attendance === "yes" && data.numberOfGuests > 0) {
    return data.guestNames && data.guestNames.length === data.numberOfGuests;
  }
  return true;
}, {
  message: "Please provide names for all guests when attending",
  path: ["guestNames"],
}).refine((data) => {
  // When not attending, guest count should be 0
  if (data.attendance === "no" && data.numberOfGuests > 0) {
    return false;
  }
  return true;
}, {
  message: "Guest count must be 0 when not attending",
  path: ["numberOfGuests"],
}).refine((data) => {
  // Guest names array length should not exceed guest count
  if (data.guestNames && data.guestNames.length > data.numberOfGuests) {
    return false;
  }
  return true;
}, {
  message: "Number of guest names cannot exceed guest count",
  path: ["guestNames"],
});

// Individual guest schema (simplified for guest names only)
export const guestSchema = z.object({
  name: guestNameSchema,
});

// Schema for validating guest names array specifically
export const guestNamesSchema = z.array(guestNameSchema).max(10, "Maximum 10 guest names allowed");

// Complete RSVP schema (same as rsvpFormSchema since it already includes guest validation)
export const completeRSVPSchema = rsvpFormSchema;

// Email uniqueness validation (for server-side use)
export const emailUniquenessSchema = z.object({
  email: emailSchema,
  excludeId: z.string().optional(), // For update operations
});

// Schema for email validation only
export const emailValidationSchema = z.object({
  email: emailSchema,
});

// Type inference from schemas
export type RSVPFormData = z.infer<typeof rsvpFormSchema>;
export type GuestData = z.infer<typeof guestSchema>;
export type GuestNamesData = z.infer<typeof guestNamesSchema>;
export type CompleteRSVPData = z.infer<typeof completeRSVPSchema>;
export type EmailValidationData = z.infer<typeof emailValidationSchema>;

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

// Utility function to transform Zod errors to our ValidationError format
export function transformZodErrors(error: z.ZodError): ValidationError[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}

// Validation functions
export async function validateRSVPForm(data: unknown): Promise<ValidationResult<RSVPFormData>> {
  try {
    const validatedData = rsvpFormSchema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: transformZodErrors(error),
      };
    }
    throw error;
  }
}

export async function validateCompleteRSVP(data: unknown): Promise<ValidationResult<CompleteRSVPData>> {
  try {
    const validatedData = completeRSVPSchema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: transformZodErrors(error),
      };
    }
    throw error;
  }
}

export async function validateEmail(data: unknown): Promise<ValidationResult<EmailValidationData>> {
  try {
    const validatedData = emailValidationSchema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: transformZodErrors(error),
      };
    }
    throw error;
  }
}

// Server-side validation helpers
export function createServerValidationError(field: string, message: string): ValidationError {
  return { field, message };
}

export function createServerValidationResult<T>(
  data?: T,
  errors?: ValidationError[]
): ValidationResult<T> {
  return {
    success: !errors || errors.length === 0,
    data,
    errors,
  };
}
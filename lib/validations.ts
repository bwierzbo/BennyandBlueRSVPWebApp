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

// RSVP Form Schema
export const rsvpFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  attendance: attendanceSchema,
  guestCount: z
    .number()
    .int("Number of guests must be a whole number")
    .min(0, "Number of guests cannot be negative")
    .max(5, "Maximum 5 additional guests allowed")
    .optional()
    .default(0),
  dietaryRestrictions: z
    .string()
    .max(500, "Dietary restrictions must be 500 characters or less")
    .optional(),
  notes: z
    .string()
    .max(1000, "Notes must be 1000 characters or less")
    .optional(),
});

// Guest Schema for additional guests
export const guestSchema = z.object({
  name: nameSchema,
  dietaryRestrictions: z
    .string()
    .max(500, "Dietary restrictions must be 500 characters or less")
    .optional(),
});

// Schema for multiple guests
export const multipleGuestsSchema = z.array(guestSchema).max(5, "Maximum 5 additional guests allowed");

// Complete RSVP schema including guests
export const completeRSVPSchema = rsvpFormSchema.extend({
  guests: multipleGuestsSchema.optional(),
});

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
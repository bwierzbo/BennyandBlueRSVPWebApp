import { type ValidationError } from "./validations"

// User-friendly error message mappings
export const ERROR_MESSAGES = {
  // Required field errors
  REQUIRED_NAME: "Please enter your full name",
  REQUIRED_EMAIL: "Please enter your email address",
  REQUIRED_ATTENDANCE: "Please let us know if you'll be attending",

  // Format validation errors
  INVALID_EMAIL: "Please enter a valid email address (e.g., name@example.com)",
  INVALID_NAME: "Name can only contain letters, spaces, hyphens, and apostrophes",
  INVALID_GUEST_COUNT: "Number of guests must be a whole number",

  // Business logic errors
  EMAIL_TOO_LONG: "Email address is too long (maximum 254 characters)",
  NAME_TOO_LONG: "Name is too long (maximum 100 characters)",
  GUEST_COUNT_NEGATIVE: "Number of guests cannot be negative",
  GUEST_COUNT_TOO_HIGH: "Sorry, we can only accommodate up to 10 guests per RSVP",
  GUEST_NAMES_REQUIRED: "Please provide names for all guests when attending",
  GUEST_NAME_REQUIRED: "Guest name is required",
  GUEST_NAME_TOO_LONG: "Guest name is too long (maximum 100 characters)",
  GUEST_NAME_INVALID: "Guest name can only contain letters, numbers, spaces, hyphens, and apostrophes",
  GUEST_NAMES_TOO_MANY: "Maximum 10 guest names allowed",
  GUEST_NAMES_MISMATCH: "Number of guest names cannot exceed guest count",
  GUEST_COUNT_NOT_ATTENDING: "Guest count must be 0 when not attending",
  DIETARY_RESTRICTIONS_TOO_LONG: "Dietary restrictions note is too long (maximum 500 characters)",
  NOTES_TOO_LONG: "Notes are too long (maximum 1000 characters)",

  // Server-side errors
  EMAIL_ALREADY_EXISTS: "This email address has already been used for an RSVP. If you need to update your response, please contact us directly.",
  SERVER_ERROR: "We're having trouble processing your request right now. Please try again in a few moments.",
  NETWORK_ERROR: "Unable to connect to our servers. Please check your internet connection and try again.",
  VALIDATION_FAILED: "Please check the form and correct any errors before submitting",

  // Success messages
  RSVP_SUBMITTED: "Thank you! Your RSVP has been submitted successfully.",
  EMAIL_AVAILABLE: "This email address is available",
} as const

// Error message enhancement function
export function enhanceErrorMessage(error: ValidationError): ValidationError {
  const fieldSpecificMessages: Record<string, Record<string, string>> = {
    name: {
      "String must contain at least 1 character(s)": ERROR_MESSAGES.REQUIRED_NAME,
      "Name is required": ERROR_MESSAGES.REQUIRED_NAME,
      "Name must be 100 characters or less": ERROR_MESSAGES.NAME_TOO_LONG,
      "Name can only contain letters, spaces, hyphens, and apostrophes": ERROR_MESSAGES.INVALID_NAME,
    },
    email: {
      "Email is required": ERROR_MESSAGES.REQUIRED_EMAIL,
      "Please enter a valid email address": ERROR_MESSAGES.INVALID_EMAIL,
      "Invalid email": ERROR_MESSAGES.INVALID_EMAIL,
      "Email must be 254 characters or less": ERROR_MESSAGES.EMAIL_TOO_LONG,
      "This email address has already been used for an RSVP": ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
    },
    attendance: {
      "Please select your attendance status": ERROR_MESSAGES.REQUIRED_ATTENDANCE,
      "Attendance must be 'yes' or 'no'": ERROR_MESSAGES.REQUIRED_ATTENDANCE,
    },
    numberOfGuests: {
      "Number of guests must be a whole number": ERROR_MESSAGES.INVALID_GUEST_COUNT,
      "Number of guests cannot be negative": ERROR_MESSAGES.GUEST_COUNT_NEGATIVE,
      "Maximum 10 guests allowed": ERROR_MESSAGES.GUEST_COUNT_TOO_HIGH,
      "Guest count must be 0 when not attending": ERROR_MESSAGES.GUEST_COUNT_NOT_ATTENDING,
    },
    guestNames: {
      "Please provide names for all guests when attending": ERROR_MESSAGES.GUEST_NAMES_REQUIRED,
      "Maximum 10 guest names allowed": ERROR_MESSAGES.GUEST_NAMES_TOO_MANY,
      "Number of guest names cannot exceed guest count": ERROR_MESSAGES.GUEST_NAMES_MISMATCH,
      "Guest name is required": ERROR_MESSAGES.GUEST_NAME_REQUIRED,
      "Guest name must be 100 characters or less": ERROR_MESSAGES.GUEST_NAME_TOO_LONG,
      "Guest name can only contain letters, numbers, spaces, hyphens, and apostrophes": ERROR_MESSAGES.GUEST_NAME_INVALID,
    },
    dietaryRestrictions: {
      "Dietary restrictions must be 500 characters or less": ERROR_MESSAGES.DIETARY_RESTRICTIONS_TOO_LONG,
    },
    notes: {
      "Notes must be 1000 characters or less": ERROR_MESSAGES.NOTES_TOO_LONG,
    },
  }

  const fieldMessages = fieldSpecificMessages[error.field]
  if (fieldMessages && fieldMessages[error.message]) {
    return {
      ...error,
      message: fieldMessages[error.message],
    }
  }

  return error
}

// Function to enhance multiple errors
export function enhanceErrorMessages(errors: ValidationError[]): ValidationError[] {
  return errors.map(enhanceErrorMessage)
}

// Function to get a summary error message for display
export function getErrorSummary(errors: ValidationError[]): string {
  if (errors.length === 0) return ""

  if (errors.length === 1) {
    return errors[0].message
  }

  const hasFormError = errors.some(e => e.field === "_form")
  if (hasFormError) {
    const formError = errors.find(e => e.field === "_form")
    return formError!.message
  }

  return `Please correct ${errors.length} errors in the form before submitting.`
}

// Function to group errors by field for easy display
export function groupErrorsByField(errors: ValidationError[]): Record<string, string[]> {
  return errors.reduce((acc, error) => {
    if (!acc[error.field]) {
      acc[error.field] = []
    }
    acc[error.field].push(error.message)
    return acc
  }, {} as Record<string, string[]>)
}

// Function to check if a specific field has errors
export function hasFieldError(errors: ValidationError[], field: string): boolean {
  return errors.some(error => error.field === field)
}

// Function to get errors for a specific field
export function getFieldErrors(errors: ValidationError[], field: string): string[] {
  return errors.filter(error => error.field === field).map(error => error.message)
}

// Function to get the first error for a field (useful for single error display)
export function getFirstFieldError(errors: ValidationError[], field: string): string | null {
  const fieldErrors = getFieldErrors(errors, field)
  return fieldErrors.length > 0 ? fieldErrors[0] : null
}

// Utility to format error for user display
export function formatErrorForDisplay(error: unknown): string {
  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes("fetch")) {
      return ERROR_MESSAGES.NETWORK_ERROR
    }

    if (error.message.includes("500") || error.message.includes("Internal")) {
      return ERROR_MESSAGES.SERVER_ERROR
    }

    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  return ERROR_MESSAGES.SERVER_ERROR
}
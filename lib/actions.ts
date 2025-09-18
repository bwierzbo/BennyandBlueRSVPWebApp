"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  validateCompleteRSVP,
  validateEmail,
  createServerValidationError,
  createServerValidationResult,
  type RSVPFormData,
  type ValidationResult
} from "./validations"
import { enhanceErrorMessages, ERROR_MESSAGES } from "./error-messages"
import { rsvpDb } from "./db"
import type { RSVPCreateData } from "../types"

// Database functions
async function checkEmailExists(email: string, excludeId?: string): Promise<boolean> {
  try {
    const existingRSVP = await rsvpDb.getByEmail(email)
    return existingRSVP !== null
  } catch (error) {
    console.error("Error checking email existence:", error)
    // In case of database error, return false to allow the submission to proceed
    // The create operation will catch the unique constraint violation if needed
    return false
  }
}

async function saveRSVPToDatabase(data: RSVPFormData): Promise<{ id: number }> {
  // Convert from validation form format to database format
  const dbData: RSVPCreateData = {
    name: data.name,
    email: data.email,
    isAttending: data.attendance === "yes",
    numberOfGuests: data.guestCount || 0,
    notes: data.notes || undefined
  }

  const savedRSVP = await rsvpDb.create(dbData)
  return { id: savedRSVP.id }
}

// Server action to submit RSVP
export async function submitRSVP(formData: FormData): Promise<ValidationResult<{ id: number } | undefined>> {
  try {
    // Extract data from FormData
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      attendance: formData.get("attendance"),
      guestCount: formData.get("guestCount") ? Number(formData.get("guestCount")) : 0,
      dietaryRestrictions: formData.get("dietaryRestrictions") || undefined,
      notes: formData.get("notes") || undefined,
    }

    // Validate the form data
    const validation = await validateCompleteRSVP(rawData)
    if (!validation.success) {
      return createServerValidationResult(undefined,
        validation.errors ? enhanceErrorMessages(validation.errors) : []
      )
    }

    const validatedData = validation.data!

    // Check for email uniqueness
    const emailExists = await checkEmailExists(validatedData.email)
    if (emailExists) {
      return createServerValidationResult(undefined, [
        createServerValidationError("email", ERROR_MESSAGES.EMAIL_ALREADY_EXISTS)
      ])
    }

    // Save to database
    const result = await saveRSVPToDatabase(validatedData)

    // Revalidate the relevant pages
    revalidatePath("/")
    revalidatePath("/rsvp")

    return createServerValidationResult(result)

  } catch (error) {
    console.error("RSVP submission error:", error)
    return createServerValidationResult(undefined, [
      createServerValidationError("_form", ERROR_MESSAGES.SERVER_ERROR)
    ])
  }
}

// Server action to submit RSVP and redirect to thank you page
export async function submitRSVPAndRedirect(formData: FormData): Promise<never> {
  const result = await submitRSVP(formData)

  if (result.success && result.data) {
    // Redirect to thank you page with success
    redirect("/thank-you?success=true")
  } else {
    // For now, redirect back to RSVP with error - this should be handled by the form component
    redirect("/rsvp?error=submission-failed")
  }
}

// Server action to submit RSVP with JSON data (for API route)
export async function submitRSVPJSON(data: RSVPFormData): Promise<ValidationResult<{ id: number } | undefined>> {
  try {
    // Validate the form data
    const validation = await validateCompleteRSVP(data)
    if (!validation.success) {
      return createServerValidationResult(undefined,
        validation.errors ? enhanceErrorMessages(validation.errors) : []
      )
    }

    const validatedData = validation.data!

    // Check for email uniqueness
    const emailExists = await checkEmailExists(validatedData.email)
    if (emailExists) {
      return createServerValidationResult(undefined, [
        createServerValidationError("email", ERROR_MESSAGES.EMAIL_ALREADY_EXISTS)
      ])
    }

    // Save to database
    const result = await saveRSVPToDatabase(validatedData)

    // Revalidate the relevant pages
    revalidatePath("/")
    revalidatePath("/rsvp")

    return createServerValidationResult(result)

  } catch (error) {
    console.error("RSVP submission error:", error)
    return createServerValidationResult(undefined, [
      createServerValidationError("_form", ERROR_MESSAGES.SERVER_ERROR)
    ])
  }
}

// Server action to validate email uniqueness
export async function validateEmailUniqueness(email: string): Promise<ValidationResult<boolean | undefined>> {
  try {
    // First validate email format
    const emailValidation = await validateEmail({ email })
    if (!emailValidation.success) {
      return { ...emailValidation, data: undefined }
    }

    // Check uniqueness
    const exists = await checkEmailExists(email)

    if (exists) {
      return createServerValidationResult(undefined, [
        createServerValidationError("email", ERROR_MESSAGES.EMAIL_ALREADY_EXISTS)
      ])
    }

    return createServerValidationResult(true)

  } catch (error) {
    console.error("Email validation error:", error)
    return createServerValidationResult(undefined, [
      createServerValidationError("email", "Unable to validate email at this time")
    ])
  }
}
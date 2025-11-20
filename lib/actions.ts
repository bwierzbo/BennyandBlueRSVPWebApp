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
import { sendRSVPConfirmation, rsvpFormDataToEmailParams } from "./email"

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
    numberOfGuests: data.numberOfGuests || 0,
    guestNames: data.guestNames || [],
    dietaryRestrictions: data.dietaryRestrictions || undefined,
    songRequests: data.songRequests || undefined,
    notes: data.notes || undefined
  }

  try {
    const savedRSVP = await rsvpDb.create(dbData)
    return { id: savedRSVP.id }
  } catch (error) {
    console.error("Database save error:", error)

    // Check for specific database constraint errors
    if (error instanceof Error) {
      if (error.message.includes("unique constraint") || error.message.includes("duplicate key")) {
        throw new Error("Email address is already registered for an RSVP")
      }
      if (error.message.includes("Invalid guest names") || error.message.includes("Invalid guest count")) {
        throw new Error(error.message)
      }
    }

    throw new Error("Failed to save RSVP to database")
  }
}

// Helper function to extract guest names from FormData
function extractGuestNames(formData: FormData): string[] {
  const guestNames: string[] = []

  // Check for guest names in multiple possible formats
  // Format 1: Individual guest fields (guestName0, guestName1, etc.)
  let index = 0
  while (formData.has(`guestName${index}`)) {
    const guestName = formData.get(`guestName${index}`)?.toString().trim()
    if (guestName) {
      guestNames.push(guestName)
    }
    index++
  }

  // Format 2: Array-style fields (guestNames[0], guestNames[1], etc.)
  if (guestNames.length === 0) {
    index = 0
    while (formData.has(`guestNames[${index}]`)) {
      const guestName = formData.get(`guestNames[${index}]`)?.toString().trim()
      if (guestName) {
        guestNames.push(guestName)
      }
      index++
    }
  }

  // Format 3: JSON string in single field
  if (guestNames.length === 0) {
    const guestNamesJson = formData.get("guestNames")?.toString()
    if (guestNamesJson) {
      try {
        const parsed = JSON.parse(guestNamesJson)
        if (Array.isArray(parsed)) {
          guestNames.push(...parsed.filter(name => typeof name === 'string' && name.trim().length > 0))
        }
      } catch (error) {
        // Invalid JSON, ignore
      }
    }
  }

  return guestNames
}

// Server action to submit RSVP
export async function submitRSVP(formData: FormData): Promise<ValidationResult<{ id: number } | undefined>> {
  try {
    // Extract guest names from FormData
    const guestNames = extractGuestNames(formData)

    // Extract data from FormData and map to validation schema format
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      attendance: formData.get("attendance"),
      numberOfGuests: formData.get("numberOfGuests") ? Number(formData.get("numberOfGuests")) :
                     formData.get("guestCount") ? Number(formData.get("guestCount")) : 0,
      guestNames: guestNames.length > 0 ? guestNames : undefined,
      dietaryRestrictions: formData.get("dietaryRestrictions") || undefined,
      songRequests: formData.get("songRequests") || undefined,
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
    console.log('[Server Action] Database save successful, result:', result)

    // Send confirmation email (non-blocking - don't fail if email fails)
    try {
      const emailParams = rsvpFormDataToEmailParams(validatedData)
      await sendRSVPConfirmation(emailParams)
      console.log('[Server Action] Confirmation email sent successfully')
    } catch (emailError) {
      // Log error but don't fail the RSVP submission
      console.error('[Server Action] Failed to send confirmation email:', emailError)
    }

    // Revalidate the relevant pages
    revalidatePath("/")
    revalidatePath("/rsvp")

    const validationResult = createServerValidationResult(result)
    console.log('[Server Action] Returning success result:', validationResult)
    return validationResult

  } catch (error) {
    console.error("[Server Action] RSVP submission error:", error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("Email address is already registered")) {
        return createServerValidationResult(undefined, [
          createServerValidationError("email", ERROR_MESSAGES.EMAIL_ALREADY_EXISTS)
        ])
      }
      if (error.message.includes("Invalid guest names") || error.message.includes("Invalid guest count")) {
        return createServerValidationResult(undefined, [
          createServerValidationError("guestNames", error.message)
        ])
      }
    }

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

// Server action to submit RSVP with JSON data and redirect on success
export async function submitRSVPJSON(data: RSVPFormData): Promise<ValidationResult<{ id: number } | undefined> | never> {
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
    console.log('[Server Action] Database save successful, result:', result)

    // Send confirmation email (non-blocking - don't fail if email fails)
    try {
      const emailParams = rsvpFormDataToEmailParams(validatedData)
      await sendRSVPConfirmation(emailParams)
      console.log('[Server Action] Confirmation email sent successfully')
    } catch (emailError) {
      // Log error but don't fail the RSVP submission
      console.error('[Server Action] Failed to send confirmation email:', emailError)
    }

    // Revalidate the relevant pages
    revalidatePath("/")
    revalidatePath("/rsvp")

    console.log('[Server Action] RSVP submission successful, redirecting to thank you page')
    // Redirect to thank you page on success
    redirect("/thank-you?success=true")

  } catch (error) {
    // Re-throw redirect errors - these are not actual errors but Next.js redirect signals
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error
    }

    console.error("[Server Action] RSVP submission error:", error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("Email address is already registered")) {
        return createServerValidationResult(undefined, [
          createServerValidationError("email", ERROR_MESSAGES.EMAIL_ALREADY_EXISTS)
        ])
      }
      if (error.message.includes("Invalid guest names") || error.message.includes("Invalid guest count")) {
        return createServerValidationResult(undefined, [
          createServerValidationError("guestNames", error.message)
        ])
      }
    }

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

// Server action to delete an RSVP
export async function deleteRSVP(id: number): Promise<ValidationResult<boolean | undefined>> {
  try {
    const deletedRSVP = await rsvpDb.delete(id)

    if (!deletedRSVP) {
      return createServerValidationResult(undefined, [
        createServerValidationError("_form", "RSVP not found")
      ])
    }

    // Revalidate relevant pages after deletion
    revalidatePath("/")
    revalidatePath("/rsvp")
    revalidatePath("/admin")
    revalidatePath("/admin/guests")
    revalidatePath("/admin/dietary")
    revalidatePath("/admin/songs")

    return createServerValidationResult(true)
  } catch (error) {
    console.error("Error deleting RSVP:", error)
    return createServerValidationResult(undefined, [
      createServerValidationError("_form", "Failed to delete RSVP")
    ])
  }
}
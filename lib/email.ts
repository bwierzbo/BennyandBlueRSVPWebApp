import { Resend } from 'resend'
import RSVPConfirmationEmail from '@/emails/rsvp-confirmation'
import type { RSVPFormData } from './validations'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

interface SendRSVPConfirmationParams {
  email: string
  name: string
  isAttending: boolean
  numberOfGuests: number
  guestNames?: string[]
  dietaryRestrictions?: string
  songRequests?: string
  notes?: string
}

/**
 * Send RSVP confirmation email to the guest
 */
export async function sendRSVPConfirmation(params: SendRSVPConfirmationParams) {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured. Skipping email send.')
      return {
        success: false,
        error: 'Email service not configured',
      }
    }

    const { data, error } = await resend.emails.send({
      from: 'Kourtney & Benjamin <onboarding@resend.dev>', // Change this after domain verification
      to: [params.email],
      subject: params.isAttending
        ? "We can't wait to see you at our wedding! 💕"
        : 'Thank you for your RSVP response',
      react: RSVPConfirmationEmail({
        name: params.name,
        isAttending: params.isAttending,
        numberOfGuests: params.numberOfGuests,
        guestNames: params.guestNames,
        dietaryRestrictions: params.dietaryRestrictions,
        songRequests: params.songRequests,
        notes: params.notes,
      }),
    })

    if (error) {
      console.error('Error sending email:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    console.log('Email sent successfully:', data)
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('Unexpected error sending email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Helper to convert RSVPFormData to email params
 */
export function rsvpFormDataToEmailParams(
  data: RSVPFormData
): SendRSVPConfirmationParams {
  return {
    email: data.email,
    name: data.name,
    isAttending: data.attendance === 'yes',
    numberOfGuests: data.numberOfGuests || 0,
    guestNames: data.guestNames,
    dietaryRestrictions: data.dietaryRestrictions,
    songRequests: data.songRequests,
    notes: data.notes,
  }
}

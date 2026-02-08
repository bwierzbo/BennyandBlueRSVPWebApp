import { Resend } from 'resend'
import { render } from '@react-email/render'
import RSVPConfirmationEmail from '@/emails/rsvp-confirmation'
import type { RSVPFormData } from './validations'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Retry configuration
const MAX_ATTEMPTS = 2
const RETRY_DELAY_MS = 2000

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
 * Helper to delay execution for retry logic
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Send an email via Resend with retry logic (up to 2 attempts total)
 */
async function sendWithRetry(emailPayload: {
  from: string
  to: string[]
  subject: string
  html: string
}): Promise<{ success: boolean; data?: any; error?: string }> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { data, error } = await resend.emails.send(emailPayload)

      if (error) {
        if (attempt < MAX_ATTEMPTS) {
          console.warn(`Email send attempt ${attempt} failed, retrying in ${RETRY_DELAY_MS}ms...`)
          await delay(RETRY_DELAY_MS)
          continue
        }
        console.error('Email send failed after retries:', error.message)
        return { success: false, error: error.message }
      }

      console.log('Email sent, id:', data?.id)
      return { success: true, data }
    } catch (error) {
      if (attempt < MAX_ATTEMPTS) {
        console.warn(`Email send attempt ${attempt} threw error, retrying in ${RETRY_DELAY_MS}ms...`)
        await delay(RETRY_DELAY_MS)
        continue
      }
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('Email send failed after retries:', message)
      return { success: false, error: message }
    }
  }

  // Should not reach here, but just in case
  return { success: false, error: 'Max retry attempts exceeded' }
}

/**
 * Send RSVP confirmation email to the guest
 */
export async function sendRSVPConfirmation(params: SendRSVPConfirmationParams) {
  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured. Skipping email send.')
    return {
      success: false,
      error: 'Email service not configured',
    }
  }

  try {
    // Render the email template to HTML
    const emailHtml = await render(RSVPConfirmationEmail({
      name: params.name,
      isAttending: params.isAttending,
      numberOfGuests: params.numberOfGuests,
      guestNames: params.guestNames,
      dietaryRestrictions: params.dietaryRestrictions,
      songRequests: params.songRequests,
      notes: params.notes,
    }))

    return await sendWithRetry({
      from: 'Kourtney & Benjamin <onboarding@resend.dev>', // Change this after domain verification
      to: [params.email],
      subject: params.isAttending
        ? "We can't wait to see you at our wedding! \u{1F495}"
        : 'Thank you for your RSVP response',
      html: emailHtml,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Unexpected error in sendRSVPConfirmation:', message)
    return {
      success: false,
      error: message,
    }
  }
}

/**
 * Send admin notification email when a new RSVP is submitted.
 * Set NOTIFICATION_EMAIL in .env.local to receive these notifications.
 */
export async function sendAdminNotification(rsvpData: {
  name: string
  email: string
  isAttending: boolean
  numberOfGuests: number
  dietaryRestrictions?: string
}) {
  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured. Skipping admin notification.')
    return {
      success: false,
      error: 'Email service not configured',
    }
  }

  const notificationEmail = process.env.NOTIFICATION_EMAIL
  if (!notificationEmail) {
    console.warn('NOTIFICATION_EMAIL not configured. Skipping admin notification.')
    return {
      success: false,
      error: 'Notification email not configured',
    }
  }

  const attendingText = rsvpData.isAttending ? 'Attending' : 'Not Attending'
  const subject = `New RSVP: ${rsvpData.name} - ${attendingText}`

  const bodyLines = [
    `New RSVP Submission`,
    ``,
    `Name: ${rsvpData.name}`,
    `Email: ${rsvpData.email}`,
    `Attending: ${attendingText}`,
    `Number of Guests: ${rsvpData.numberOfGuests}`,
  ]

  if (rsvpData.dietaryRestrictions) {
    bodyLines.push(`Dietary Restrictions: ${rsvpData.dietaryRestrictions}`)
  }

  const htmlBody = bodyLines.map(line => line === '' ? '<br>' : `<p>${line}</p>`).join('\n')

  try {
    return await sendWithRetry({
      from: 'Kourtney & Benjamin <onboarding@resend.dev>',
      to: [notificationEmail],
      subject,
      html: htmlBody,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Failed to send admin notification:', message)
    return {
      success: false,
      error: message,
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

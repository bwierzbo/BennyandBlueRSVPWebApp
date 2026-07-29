import { Resend } from 'resend'
import { render } from '@react-email/render'
import RSVPConfirmationEmail from '@/emails/rsvp-confirmation'
import type { RSVPFormData } from './validations'
import { renderGuestListHtml, type GuestListRsvp } from './guest-list-html'
import { renderMassEmailHtml } from './mass-email-html'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Sender address on the Resend-verified domain
const FROM_ADDRESS = 'Kourtney & Benjamin <rsvp@confirmation.bennyandblue.com>'

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
      from: FROM_ADDRESS,
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
  guestNames?: string[]
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
    `Party Size: ${rsvpData.isAttending ? rsvpData.numberOfGuests + 1 : 0} (including ${rsvpData.name})`,
  ]

  if (rsvpData.guestNames && rsvpData.guestNames.length > 0) {
    bodyLines.push(`Guest Names: ${rsvpData.guestNames.join(', ')}`)
  }

  if (rsvpData.dietaryRestrictions) {
    bodyLines.push(`Dietary Restrictions: ${rsvpData.dietaryRestrictions}`)
  }

  const htmlBody = bodyLines.map(line => line === '' ? '<br>' : `<p>${line}</p>`).join('\n')

  try {
    return await sendWithRetry({
      from: FROM_ADDRESS,
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

/**
 * Send a simplified guest list to any email address (admin-only utility).
 */
export async function sendGuestListEmail(params: {
  recipientEmail: string
  rsvps: GuestListRsvp[]
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured. Skipping guest list send.')
    return {
      success: false,
      error: 'Email service not configured',
    }
  }

  const { html, totalGuests, partyCount } = renderGuestListHtml(params.rsvps)

  return await sendWithRetry({
    from: FROM_ADDRESS,
    to: [params.recipientEmail],
    subject: `Wedding Guest List - ${totalGuests} guest${totalGuests === 1 ? '' : 's'} (${partyCount} part${partyCount === 1 ? 'y' : 'ies'})`,
    html,
  })
}

/**
 * Send the same email to a list of recipients, one at a time to preserve privacy.
 * Returns per-recipient success/failure info.
 */
export async function sendMassEmail(params: {
  recipients: string[]
  subject: string
  bodyText: string
}): Promise<{
  attempted: number
  succeeded: number
  failed: number
  failures: Array<{ email: string; error: string }>
}> {
  if (!process.env.RESEND_API_KEY) {
    return {
      attempted: params.recipients.length,
      succeeded: 0,
      failed: params.recipients.length,
      failures: params.recipients.map(email => ({ email, error: 'Email service not configured' })),
    }
  }

  const html = renderMassEmailHtml(params.bodyText)
  const failures: Array<{ email: string; error: string }> = []
  let succeeded = 0

  for (const email of params.recipients) {
    const result = await sendWithRetry({
      from: 'Kourtney & Benjamin <onboarding@resend.dev>',
      to: [email],
      subject: params.subject,
      html,
    })
    if (result.success) {
      succeeded++
    } else {
      failures.push({ email, error: result.error ?? 'Unknown error' })
    }
  }

  return {
    attempted: params.recipients.length,
    succeeded,
    failed: failures.length,
    failures,
  }
}

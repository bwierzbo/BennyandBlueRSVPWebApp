import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rsvpDb } from '@/lib/db'
import { sendMassEmail } from '@/lib/email'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const requestSchema = z.object({
  filter: z.enum(['all', 'attending', 'not_attending']),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be 200 characters or less'),
  body: z.string().min(1, 'Message body is required').max(10000, 'Message body must be 10000 characters or less'),
  dryRun: z.boolean().optional().default(false),
})

function selectRecipients(
  rsvps: Array<{ email: string; isAttending: boolean }>,
  filter: 'all' | 'attending' | 'not_attending'
): string[] {
  const matched = rsvps.filter(r => {
    if (filter === 'attending') return r.isAttending
    if (filter === 'not_attending') return !r.isAttending
    return true
  })
  const seen = new Set<string>()
  const unique: string[] = []
  for (const r of matched) {
    const key = r.email.trim().toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    unique.push(r.email)
  }
  return unique
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    // Tighter limit than the guest-list send since this can spam a lot of people.
    const limiter = rateLimit(`mass-email:${ip}`, 3, 60_000)
    if (!limiter.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => null)
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid request' },
        { status: 400 }
      )
    }

    const rsvps = await rsvpDb.getAll()
    const recipients = selectRecipients(rsvps, parsed.data.filter)

    if (parsed.data.dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        recipientCount: recipients.length,
        recipients,
      })
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients match that filter.' },
        { status: 400 }
      )
    }

    const result = await sendMassEmail({
      recipients,
      subject: parsed.data.subject,
      bodyText: parsed.data.body,
    })

    return NextResponse.json({
      success: result.failed === 0,
      ...result,
    })
  } catch (error) {
    console.error('Mass email error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

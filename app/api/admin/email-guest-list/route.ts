import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rsvpDb } from '@/lib/db'
import { sendGuestListEmail } from '@/lib/email'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const requestSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email must be 254 characters or less')
    .transform(e => e.toLowerCase().trim()),
})

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const limiter = rateLimit(`email-guest-list:${ip}`, 5, 60_000)
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

    const result = await sendGuestListEmail({
      recipientEmail: parsed.data.email,
      rsvps: rsvps.map(r => ({
        name: r.name,
        isAttending: r.isAttending,
        numberOfGuests: r.numberOfGuests,
        guestNames: r.guestNames,
      })),
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send guest list' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      recipient: parsed.data.email,
    })
  } catch (error) {
    console.error('Email guest list error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

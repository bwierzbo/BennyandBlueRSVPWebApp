import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { buildUploadKey, signUploadsSchema, type SignedUpload } from '@/lib/memories'
import { createUploadToken, isBlobConfigured } from '@/lib/blob'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const limiter = rateLimit(`memories-sign:${getClientIp(request)}`, 20, 60_000)
    if (!limiter.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => null)
    const parsed = signUploadsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid request' },
        { status: 400 }
      )
    }

    if (!isBlobConfigured()) {
      console.error('Memories upload requested but BLOB_READ_WRITE_TOKEN is not set')
      return NextResponse.json(
        { error: 'Uploads are not available right now. Please try again later.' },
        { status: 503 }
      )
    }

    const now = new Date()
    const uploads: SignedUpload[] = await Promise.all(
      parsed.data.files.map(async (file) => {
        const key = buildUploadKey(parsed.data.name, file.filename, now, randomUUID())
        return { key, token: await createUploadToken(key, file.type, file.size) }
      })
    )

    return NextResponse.json({ uploads })
  } catch (error) {
    console.error('Memories sign error:', error)
    return NextResponse.json(
      { error: 'Could not prepare the upload. Please try again.' },
      { status: 500 }
    )
  }
}

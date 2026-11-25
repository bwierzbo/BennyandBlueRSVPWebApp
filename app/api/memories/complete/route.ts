import { NextRequest, NextResponse } from 'next/server'
import { uploadsDb } from '@/lib/db'
import { completeUploadSchema, isAllowedMediaType } from '@/lib/memories'
import { headUpload, isR2Configured } from '@/lib/r2'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // One call per uploaded file, so allow a few full batches per minute
    const limiter = rateLimit(`memories-complete:${getClientIp(request)}`, 120, 60_000)
    if (!limiter.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => null)
    const parsed = completeUploadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid request' },
        { status: 400 }
      )
    }

    if (!isR2Configured()) {
      console.error('Memories upload completion requested but R2 environment variables are not set')
      return NextResponse.json(
        { error: 'Uploads are not available right now. Please try again later.' },
        { status: 503 }
      )
    }

    // Trust R2, not the client, for what was actually stored
    const stored = await headUpload(parsed.data.key)
    if (!stored) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 })
    }
    if (!isAllowedMediaType(stored.contentType)) {
      return NextResponse.json({ error: 'Only photos and videos can be uploaded' }, { status: 400 })
    }

    await uploadsDb.create({
      key: parsed.data.key,
      guestName: parsed.data.name || null,
      filename: parsed.data.filename,
      contentType: stored.contentType,
      sizeBytes: stored.size,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Memories complete error:', error)
    return NextResponse.json(
      { error: 'Could not record the upload. Please try again.' },
      { status: 500 }
    )
  }
}

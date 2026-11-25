import { NextRequest } from 'next/server'
import { POST } from '../../app/api/memories/sign/route'
import { getPayloadFromClientToken } from '@vercel/blob/client'
import { UPLOAD_TOKEN_TTL_MS } from '../blob'
import { isUploadKey } from '../memories'

// Client tokens are signed locally with HMAC, so these tests exercise the real
// route and the real Vercel Blob SDK with a throwaway token. No network is involved.
const BLOB_ENV = {
  BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_teststoreid_testsecret',
}

let ipCounter = 0
function nextIp(): string {
  ipCounter++
  return `203.0.113.${ipCounter}`
}

function signRequest(body: unknown, ip = nextIp()): NextRequest {
  return new NextRequest('http://localhost:3000/api/memories/sign', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

const validFile = { filename: 'IMG_0001.jpg', type: 'image/jpeg', size: 1234 }

describe('POST /api/memories/sign', () => {
  beforeAll(() => {
    Object.assign(process.env, BLOB_ENV)
  })

  afterAll(() => {
    for (const name of Object.keys(BLOB_ENV)) delete process.env[name]
  })

  it('returns one upload token per file, locked to its key, type and size', async () => {
    const before = Date.now()
    const response = await POST(
      signRequest({
        name: 'Aunt Mary',
        files: [validFile, { filename: '../../clip.mov', type: 'video/quicktime', size: 9_999 }],
      })
    )
    const data = await response.json()
    console.log('sign response:', JSON.stringify(data, null, 2))

    expect(response.status).toBe(200)
    expect(data.uploads).toHaveLength(2)

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const expected = [
      { suffix: '-IMG_0001.jpg', type: 'image/jpeg', size: 1234 },
      { suffix: '-clip.mov', type: 'video/quicktime', size: 9_999 },
    ]
    data.uploads.forEach((upload: { key: string; token: string }, index: number) => {
      expect(isUploadKey(upload.key)).toBe(true)
      expect(upload.key.startsWith(`guests/aunt-mary/${today}/`)).toBe(true)
      expect(upload.key.endsWith(expected[index].suffix)).toBe(true)

      expect(upload.token.startsWith('vercel_blob_client_teststoreid_')).toBe(true)
      const payload = getPayloadFromClientToken(upload.token)
      console.log('token payload:', payload)
      // The token must not be usable for any other object, type or size
      expect(payload.pathname).toBe(upload.key)
      expect(payload.allowedContentTypes).toEqual([expected[index].type])
      expect(payload.maximumSizeInBytes).toBe(expected[index].size)
      expect(payload.addRandomSuffix).toBe(false)
      expect(payload.allowOverwrite).toBe(false)
      expect(payload.validUntil).toBeGreaterThanOrEqual(before + UPLOAD_TOKEN_TTL_MS)
      expect(payload.validUntil).toBeLessThanOrEqual(Date.now() + UPLOAD_TOKEN_TTL_MS)
      // The read-write token itself must never reach the browser
      expect(upload.token).not.toContain('testsecret')
      expect(Buffer.from(upload.token.split('_').pop()!, 'base64').toString()).not.toContain('testsecret')
    })

    expect(data.uploads[0].key).not.toBe(data.uploads[1].key)
  })

  it('files uploads without a name under guests/guest/', async () => {
    const response = await POST(signRequest({ files: [validFile] }))
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.uploads[0].key).toMatch(/^guests\/guest\/\d{8}\//)
  })

  it('rejects invalid bodies with 400 and a readable message', async () => {
    const cases: Array<[unknown, string]> = [
      ['not json', 'Expected object, received null'],
      [{ files: [] }, 'Choose at least one file'],
      [{ files: [{ ...validFile, type: 'application/pdf' }] }, 'Only photos and videos can be uploaded'],
      [{ files: [{ ...validFile, size: 5 * 1024 ** 3 }] }, 'Each file must be 4.5 GB or smaller'],
      [{ files: Array.from({ length: 51 }, () => validFile) }, 'Upload up to 50 files at a time'],
    ]
    for (const [body, message] of cases) {
      const response = await POST(signRequest(body))
      const data = await response.json()
      console.log('400 case:', JSON.stringify(body).slice(0, 80), '->', data)
      expect(response.status).toBe(400)
      expect(data.error).toBe(message)
      expect(data.uploads).toBeUndefined()
    }
  })

  it('rate limits each IP to 20 requests per minute', async () => {
    const ip = nextIp()
    for (let i = 0; i < 20; i++) {
      const response = await POST(signRequest({ files: [validFile] }, ip))
      expect(response.status, `request ${i + 1}`).toBe(200)
    }
    const blocked = await POST(signRequest({ files: [validFile] }, ip))
    expect(blocked.status).toBe(429)

    // A different guest is unaffected
    const other = await POST(signRequest({ files: [validFile] }))
    expect(other.status).toBe(200)
  })
})

describe('POST /api/memories/sign without Blob storage configured', () => {
  it('returns 503 instead of throwing', async () => {
    const saved = process.env.BLOB_READ_WRITE_TOKEN
    delete process.env.BLOB_READ_WRITE_TOKEN
    try {
      const response = await POST(signRequest({ files: [validFile] }))
      expect(response.status).toBe(503)
    } finally {
      if (saved !== undefined) process.env.BLOB_READ_WRITE_TOKEN = saved
    }
  })
})

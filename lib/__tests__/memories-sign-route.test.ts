import { NextRequest } from 'next/server'
import { POST } from '../../app/api/memories/sign/route'
import { isUploadKey } from '../memories'

// Presigning is offline HMAC signing, so these tests exercise the real route
// and the real AWS SDK with throwaway credentials. No network is involved.
const R2_ENV = {
  R2_ACCOUNT_ID: 'testaccount',
  R2_ACCESS_KEY_ID: 'test-access-key-id',
  R2_SECRET_ACCESS_KEY: 'test-secret-access-key',
  R2_BUCKET: 'test-bucket',
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
    Object.assign(process.env, R2_ENV)
  })

  afterAll(() => {
    for (const name of Object.keys(R2_ENV)) delete process.env[name]
  })

  it('returns one presigned R2 PUT URL per file with type and size signed', async () => {
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
    data.uploads.forEach((upload: { key: string; url: string }, index: number) => {
      expect(isUploadKey(upload.key)).toBe(true)
      expect(upload.key.startsWith(`guests/aunt-mary/${today}/`)).toBe(true)

      const url = new URL(upload.url)
      expect(url.protocol).toBe('https:')
      expect(url.host).toBe('test-bucket.testaccount.r2.cloudflarestorage.com')
      expect(decodeURIComponent(url.pathname)).toBe(`/${upload.key}`)
      expect(url.searchParams.get('X-Amz-Expires')).toBe('3600')
      expect(url.searchParams.get('X-Amz-Credential')).toContain('/auto/s3/aws4_request')
      // Content-Type and Content-Length must be signed so R2 enforces them
      const signedHeaders = url.searchParams.get('X-Amz-SignedHeaders')!.split(';')
      expect(signedHeaders).toEqual(expect.arrayContaining(['content-length', 'content-type', 'host']))
      // Nothing a browser cannot send (e.g. SDK checksums) may be required
      expect(signedHeaders.filter((h) => !['content-length', 'content-type', 'host'].includes(h))).toEqual([])
      expect([...url.searchParams.keys()].filter((k) => /checksum/i.test(k))).toEqual([])
      expect(index === 0 ? upload.key.endsWith('-IMG_0001.jpg') : upload.key.endsWith('-clip.mov')).toBe(true)
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

describe('POST /api/memories/sign without R2 configured', () => {
  it('returns 503 instead of throwing', async () => {
    const saved = process.env.R2_BUCKET
    delete process.env.R2_BUCKET
    try {
      const response = await POST(signRequest({ files: [validFile] }))
      expect(response.status).toBe(503)
    } finally {
      if (saved !== undefined) process.env.R2_BUCKET = saved
    }
  })
})

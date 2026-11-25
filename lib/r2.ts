import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const UPLOAD_URL_TTL_SECONDS = 60 * 60
const DOWNLOAD_URL_TTL_SECONDS = 15 * 60

const R2_ENV_VARS = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET'] as const

export function isR2Configured(): boolean {
  return R2_ENV_VARS.every((name) => Boolean(process.env[name]))
}

let cached: { client: S3Client; bucket: string } | null = null

function getR2(): { client: S3Client; bucket: string } {
  if (cached) return cached

  const missing = R2_ENV_VARS.filter((name) => !process.env[name])
  if (missing.length > 0) {
    throw new Error(`R2 storage is not configured (missing ${missing.join(', ')})`)
  }

  cached = {
    bucket: process.env.R2_BUCKET!,
    client: new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
      // The SDK's default CRC32 checksum would be baked into the presigned URL
      // and browsers cannot supply it, so only checksum when S3 requires it.
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    }),
  }
  return cached
}

/**
 * Presigned PUT for a single object. Content-Type and Content-Length are part
 * of the signature, so R2 rejects an upload whose type or size differs from
 * what was validated when signing.
 */
export async function presignUpload(key: string, contentType: string, size: number): Promise<string> {
  const { client, bucket } = getR2()
  return getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType, ContentLength: size }),
    {
      expiresIn: UPLOAD_URL_TTL_SECONDS,
      signableHeaders: new Set(['content-type', 'content-length']),
    }
  )
}

/** Short-lived presigned GET that downloads the object under its original filename. */
export async function presignDownload(key: string, filename: string): Promise<string> {
  const { client, bucket } = getR2()
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    }),
    { expiresIn: DOWNLOAD_URL_TTL_SECONDS }
  )
}

/** Size and type of an uploaded object as stored by R2, or null when it does not exist. */
export async function headUpload(key: string): Promise<{ size: number; contentType: string } | null> {
  const { client, bucket } = getR2()
  try {
    const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return {
      size: head.ContentLength ?? 0,
      contentType: head.ContentType ?? 'application/octet-stream',
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'NotFound') return null
    throw error
  }
}

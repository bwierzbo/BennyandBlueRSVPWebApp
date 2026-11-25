import { BlobNotFoundError, head, issueSignedToken, presignUrl } from '@vercel/blob'
import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client'

// Long enough for a multi-GB video on a slow connection. The token is useless
// for anything but the one pathname, type and size it was issued for.
export const UPLOAD_TOKEN_TTL_MS = 6 * 60 * 60 * 1000
const DOWNLOAD_URL_TTL_MS = 15 * 60 * 1000

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

/**
 * Client token that lets a browser upload exactly one object: this pathname,
 * this content type, at most this many bytes, and never overwriting.
 */
export async function createUploadToken(key: string, contentType: string, size: number): Promise<string> {
  return generateClientTokenFromReadWriteToken({
    pathname: key,
    allowedContentTypes: [contentType],
    maximumSizeInBytes: size,
    addRandomSuffix: false,
    allowOverwrite: false,
    validUntil: Date.now() + UPLOAD_TOKEN_TTL_MS,
  })
}

/** Size and type of an uploaded object as stored by Vercel Blob, or null when it does not exist. */
export async function headUpload(key: string): Promise<{ size: number; contentType: string } | null> {
  try {
    const blob = await head(key)
    return { size: blob.size, contentType: blob.contentType }
  } catch (error) {
    if (error instanceof BlobNotFoundError) return null
    throw error
  }
}

/** Short-lived presigned GET URL for each key in the private store. */
export async function presignDownloads(keys: string[]): Promise<Map<string, string>> {
  if (keys.length === 0) return new Map()

  const validUntil = Date.now() + DOWNLOAD_URL_TTL_MS
  // One delegation for the whole store, then each URL is signed locally
  const signedToken = await issueSignedToken({ pathname: '*', operations: ['get'], validUntil })
  const entries = await Promise.all(
    keys.map(async (key) => {
      const { presignedUrl } = await presignUrl(signedToken, {
        operation: 'get',
        pathname: key,
        access: 'private',
        validUntil,
      })
      return [key, presignedUrl] as [string, string]
    })
  )
  return new Map(entries)
}

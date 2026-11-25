import { z } from 'zod'
import type { GuestUpload } from '../types'

// Limits shared by the uploader (client) and the API routes (server)
export const MAX_FILES_PER_BATCH = 50
export const MAX_FILE_SIZE_BYTES = 4.5 * 1024 * 1024 * 1024
export const MAX_GUEST_NAME_LENGTH = 100

const MAX_SLUG_LENGTH = 50
const MAX_FILENAME_LENGTH = 100
const DEFAULT_GUEST_SLUG = 'guest'
const DEFAULT_FILENAME = 'file'

const MEDIA_TYPE_PATTERN = /^(image|video)\/[a-z0-9][a-z0-9.+-]*$/i

// Some browsers report an empty type for formats they cannot preview
const EXTENSION_CONTENT_TYPES: Record<string, string> = {
  heic: 'image/heic',
  heif: 'image/heif',
  dng: 'image/x-adobe-dng',
  mov: 'video/quicktime',
  mp4: 'video/mp4',
  m4v: 'video/x-m4v',
  mkv: 'video/x-matroska',
  avi: 'video/x-msvideo',
  '3gp': 'video/3gpp',
}

export function isAllowedMediaType(type: string): boolean {
  return MEDIA_TYPE_PATTERN.test(type)
}

/** Content type to upload with: the browser's, or one inferred from the extension when the browser gives none. */
export function resolveContentType(filename: string, type: string): string {
  if (type) return type
  const extension = filename.split('.').pop()?.toLowerCase() ?? ''
  return EXTENSION_CONTENT_TYPES[extension] ?? ''
}

function truncate(value: string, maxLength: number): string {
  return Array.from(value).slice(0, maxLength).join('')
}

/** Folder-safe version of a guest's name: lowercase letters, digits and single dashes only. */
export function slugifyGuestName(name?: string): string {
  const slug = truncate(
    (name ?? '')
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, ''),
    MAX_SLUG_LENGTH
  ).replace(/-+$/, '')
  return slug || DEFAULT_GUEST_SLUG
}

/**
 * Object-key-safe filename: no path separators, no dot segments, no control
 * characters, bounded length with the extension preserved.
 */
export function sanitizeFilename(filename: string): string {
  const clean = filename
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/-{2,}/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')

  if (!clean) return DEFAULT_FILENAME

  const dotIndex = clean.lastIndexOf('.')
  if (dotIndex <= 0) return truncate(clean, MAX_FILENAME_LENGTH)

  const extension = truncate(clean.slice(dotIndex), 12)
  const stem = truncate(clean.slice(0, dotIndex), MAX_FILENAME_LENGTH - Array.from(extension).length)
  return `${stem.replace(/[.-]+$/, '') || DEFAULT_FILENAME}${extension}`
}

/** Pathname in the Blob store: guests/<slugified-name-or-guest>/<YYYYMMDD>/<uuid>-<sanitized-filename> */
export function buildUploadKey(
  guestName: string | undefined,
  filename: string,
  date: Date,
  uuid: string
): string {
  const day = date.toISOString().slice(0, 10).replace(/-/g, '')
  return `guests/${slugifyGuestName(guestName)}/${day}/${uuid}-${sanitizeFilename(filename)}`
}

const UPLOAD_KEY_PATTERN =
  /^guests\/[\p{L}\p{N}-]{1,50}\/\d{8}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[\p{L}\p{N}._-]{1,100}$/u

/** True only for keys that buildUploadKey could have produced. */
export function isUploadKey(key: string): boolean {
  return UPLOAD_KEY_PATTERN.test(key) && !key.includes('..')
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex++
  }
  return `${value >= 100 ? Math.round(value) : value.toFixed(1)} ${units[unitIndex]}`
}

export interface GuestUploadGroup {
  guestName: string
  uploads: GuestUpload[]
  totalBytes: number
}

export const ANONYMOUS_GUEST_LABEL = 'Anonymous guest'

/** Group uploads by guest name (case-insensitive), keeping the order guests first appear in. */
export function groupUploadsByGuest(uploads: GuestUpload[]): GuestUploadGroup[] {
  const groups = new Map<string, GuestUploadGroup>()
  for (const upload of uploads) {
    const guestName = upload.guestName?.trim() || ANONYMOUS_GUEST_LABEL
    const groupKey = guestName.toLowerCase()
    const group = groups.get(groupKey) ?? { guestName, uploads: [], totalBytes: 0 }
    group.uploads.push(upload)
    group.totalBytes += upload.sizeBytes
    groups.set(groupKey, group)
  }
  return Array.from(groups.values())
}

const guestNameSchema = z
  .string()
  .trim()
  .max(MAX_GUEST_NAME_LENGTH, `Name must be ${MAX_GUEST_NAME_LENGTH} characters or less`)
  .optional()

const filenameSchema = z
  .string()
  .min(1, 'Filename is required')
  .max(255, 'Filename must be 255 characters or less')

export const uploadFileSchema = z.object({
  filename: filenameSchema,
  type: z.string().refine(isAllowedMediaType, 'Only photos and videos can be uploaded'),
  size: z
    .number()
    .int('File size must be a whole number of bytes')
    .positive('File is empty')
    .max(MAX_FILE_SIZE_BYTES, `Each file must be ${formatBytes(MAX_FILE_SIZE_BYTES)} or smaller`),
})

export const signUploadsSchema = z.object({
  name: guestNameSchema,
  files: z
    .array(uploadFileSchema)
    .min(1, 'Choose at least one file')
    .max(MAX_FILES_PER_BATCH, `Upload up to ${MAX_FILES_PER_BATCH} files at a time`),
})

export const completeUploadSchema = z.object({
  key: z.string().refine(isUploadKey, 'Invalid upload key'),
  name: guestNameSchema,
  filename: filenameSchema,
})

export type UploadFileInput = z.infer<typeof uploadFileSchema>
export type SignUploadsInput = z.infer<typeof signUploadsSchema>
export type CompleteUploadInput = z.infer<typeof completeUploadSchema>

// A single-use upload grant: the client token only allows writing this key,
// with the content type and size that were validated when it was issued.
export interface SignedUpload {
  key: string
  token: string
}

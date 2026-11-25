import {
  ANONYMOUS_GUEST_LABEL,
  MAX_FILES_PER_BATCH,
  MAX_FILE_SIZE_BYTES,
  buildUploadKey,
  completeUploadSchema,
  formatBytes,
  groupUploadsByGuest,
  isAllowedMediaType,
  isUploadKey,
  resolveContentType,
  sanitizeFilename,
  signUploadsSchema,
  slugifyGuestName,
} from '../memories'
import type { GuestUpload } from '../../types'

const UUID = '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b'
const DATE = new Date('2026-08-23T04:30:00Z')

const validFile = { filename: 'IMG_0001.HEIC', type: 'image/heic', size: 2_500_000 }

describe('slugifyGuestName', () => {
  it('lowercases and dashes an ordinary name', () => {
    expect(slugifyGuestName('Aunt Mary-Jo O\'Neil')).toBe('aunt-mary-jo-o-neil')
  })

  it('falls back to "guest" when no usable name is given', () => {
    for (const name of [undefined, '', '   ', '///', '..', '💍🎉', '\u0000\n']) {
      expect(slugifyGuestName(name), `name=${JSON.stringify(name)}`).toBe('guest')
    }
  })

  it('removes every path separator and dot from traversal attempts', () => {
    const slug = slugifyGuestName('../../etc/passwd\\..\\x')
    expect(slug).toBe('etc-passwd-x')
    expect(slug).not.toMatch(/[./\\]/)
  })

  it('keeps unicode letters so non-Latin names still get their own folder', () => {
    expect(slugifyGuestName('Zoë Müller')).toBe('zoë-müller')
    expect(slugifyGuestName('张伟')).toBe('张伟')
    expect(slugifyGuestName('Олена Шевченко')).toBe('олена-шевченко')
  })

  it('normalizes compatibility forms to a single representation', () => {
    // "e" + combining acute accent vs. precomposed "é"
    expect(slugifyGuestName('Rene\u0301')).toBe(slugifyGuestName('Ren\u00e9'))
    // fullwidth letters fold to ASCII
    expect(slugifyGuestName('ＡＢＣ')).toBe('abc')
  })

  it('caps very long names at 50 characters without a trailing dash', () => {
    const slug = slugifyGuestName('a'.repeat(49) + ' ' + 'b'.repeat(500))
    expect(Array.from(slug).length).toBeLessThanOrEqual(50)
    expect(slug).toBe('a'.repeat(49))
  })
})

describe('sanitizeFilename', () => {
  it('leaves an ordinary camera filename alone', () => {
    expect(sanitizeFilename('IMG_1234.HEIC')).toBe('IMG_1234.HEIC')
  })

  it('strips path traversal and separators', () => {
    const cases: Record<string, string> = {
      '../../../etc/passwd': 'etc-passwd',
      '..\\..\\windows\\system32\\evil.jpg': 'windows-system32-evil.jpg',
      '/absolute/path/photo.jpg': 'absolute-path-photo.jpg',
      'photo..jpg': 'photo.jpg',
      '....//....//x.png': 'x.png',
      '.htaccess': 'htaccess',
      '%2e%2e%2fsecret.png': '2e-2e-2fsecret.png',
    }
    for (const [input, expected] of Object.entries(cases)) {
      const result = sanitizeFilename(input)
      expect(result, `input=${input}`).toBe(expected)
      expect(result, `input=${input}`).not.toMatch(/[\/\\]|\.\./)
    }
  })

  it('removes control characters, whitespace and query-string characters', () => {
    expect(sanitizeFilename('my photo\u0000\n(1)?.jpg')).toBe('my-photo-1.jpg')
    expect(sanitizeFilename('a&b=c#d.mov')).toBe('a-b-c-d.mov')
  })

  it('keeps unicode letters and drops emoji', () => {
    expect(sanitizeFilename('fête 🎉 soirée.jpg')).toBe('fête-soirée.jpg')
    expect(sanitizeFilename('结婚照片.png')).toBe('结婚照片.png')
  })

  it('falls back to "file" when nothing usable remains', () => {
    for (const name of ['', '...', '///', '🎉🎉', '-.-']) {
      expect(sanitizeFilename(name), `name=${JSON.stringify(name)}`).toBe('file')
    }
  })

  it('truncates very long names to 100 characters and keeps the extension', () => {
    const result = sanitizeFilename('x'.repeat(5000) + '.mp4')
    expect(Array.from(result).length).toBe(100)
    expect(result.endsWith('.mp4')).toBe(true)
  })

  it('counts length in characters, not UTF-16 units, for astral-plane letters', () => {
    // U+20000 is a CJK letter outside the BMP (2 UTF-16 code units each)
    const result = sanitizeFilename('\u{20000}'.repeat(300) + '.jpg')
    expect(Array.from(result).length).toBe(100)
    expect(result.endsWith('.jpg')).toBe(true)
    // no lone surrogates left behind by truncation
    expect(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(result)).toBe(false)
  })

  it('bounds an absurdly long extension', () => {
    const result = sanitizeFilename('clip.' + 'z'.repeat(400))
    expect(Array.from(result).length).toBeLessThanOrEqual(100)
    expect(result.startsWith('clip.')).toBe(true)
  })
})

describe('buildUploadKey', () => {
  it('builds guests/<slug>/<YYYYMMDD>/<uuid>-<filename> using the UTC date', () => {
    expect(buildUploadKey('Aunt Mary', 'IMG 1.jpg', DATE, UUID)).toBe(
      `guests/aunt-mary/20260823/${UUID}-IMG-1.jpg`
    )
  })

  it('uses the guest folder when no name is given', () => {
    expect(buildUploadKey(undefined, 'a.png', DATE, UUID)).toBe(`guests/guest/20260823/${UUID}-a.png`)
  })

  it('always yields exactly four path segments under guests/, whatever the input', () => {
    const hostile = [
      ['../../admin', '../../../secrets.env'],
      ['a/b/c', 'd/e/f.jpg'],
      ['..', '..'],
      ['x'.repeat(10_000), 'y'.repeat(10_000) + '.mov'],
      ['\u202Egpj.exe', 'evil\u202Egpj.exe'],
    ]
    for (const [name, filename] of hostile) {
      const key = buildUploadKey(name, filename, DATE, UUID)
      const segments = key.split('/')
      expect(segments.length, key).toBe(4)
      expect(segments[0], key).toBe('guests')
      expect(key, key).not.toContain('..')
      expect(isUploadKey(key), key).toBe(true)
      expect(new TextEncoder().encode(key).length, key).toBeLessThanOrEqual(1024)
    }
  })
})

describe('isUploadKey', () => {
  it('accepts keys produced by buildUploadKey, including unicode ones', () => {
    expect(isUploadKey(buildUploadKey('张伟', '结婚照片.png', DATE, UUID))).toBe(true)
  })

  it('rejects keys outside the guests/ layout', () => {
    const invalid = [
      '',
      'guests/',
      `other/guest/20260823/${UUID}-a.png`,
      `guests/guest/20260823/a.png`,
      `guests/guest/2026-08-23/${UUID}-a.png`,
      `guests/../20260823/${UUID}-a.png`,
      `guests/guest/20260823/${UUID}-a/../../b.png`,
      `guests/guest/20260823/${UUID}-a..png`,
      `/guests/guest/20260823/${UUID}-a.png`,
      `guests/guest/20260823/${UUID}-a.png\n`,
    ]
    for (const key of invalid) {
      expect(isUploadKey(key), `key=${JSON.stringify(key)}`).toBe(false)
    }
  })
})

describe('isAllowedMediaType / resolveContentType', () => {
  it('allows image/* and video/* only', () => {
    for (const type of ['image/jpeg', 'image/heic', 'image/svg+xml', 'video/mp4', 'video/quicktime', 'VIDEO/MP4']) {
      expect(isAllowedMediaType(type), type).toBe(true)
    }
    for (const type of ['', 'application/pdf', 'text/html', 'image/', 'image', 'image/*', 'video/mp4; codecs=avc1', 'ximage/png', 'image/png\nx']) {
      expect(isAllowedMediaType(type), JSON.stringify(type)).toBe(false)
    }
  })

  it('prefers the browser-reported type and only infers when it is missing', () => {
    expect(resolveContentType('a.heic', 'image/jpeg')).toBe('image/jpeg')
    expect(resolveContentType('IMG_1.HEIC', '')).toBe('image/heic')
    expect(resolveContentType('clip.MOV', '')).toBe('video/quicktime')
    expect(resolveContentType('notes.txt', '')).toBe('')
    expect(resolveContentType('noextension', '')).toBe('')
  })
})

describe('signUploadsSchema', () => {
  it('accepts a valid request with and without a name', () => {
    expect(signUploadsSchema.safeParse({ name: 'Aunt Mary', files: [validFile] }).success).toBe(true)
    expect(signUploadsSchema.safeParse({ files: [validFile] }).success).toBe(true)
  })

  it('trims the name', () => {
    const parsed = signUploadsSchema.parse({ name: '  Aunt Mary  ', files: [validFile] })
    expect(parsed.name).toBe('Aunt Mary')
  })

  it('rejects malformed bodies', () => {
    for (const body of [null, undefined, 'x', 42, [], {}, { files: 'nope' }, { files: [null] }, { name: 7, files: [validFile] }]) {
      expect(signUploadsSchema.safeParse(body).success, JSON.stringify(body)).toBe(false)
    }
  })

  it('requires between 1 and 50 files', () => {
    expect(signUploadsSchema.safeParse({ files: [] }).success).toBe(false)
    const full = Array.from({ length: MAX_FILES_PER_BATCH }, () => validFile)
    expect(signUploadsSchema.safeParse({ files: full }).success).toBe(true)
    const tooMany = signUploadsSchema.safeParse({ files: [...full, validFile] })
    expect(tooMany.success).toBe(false)
    expect(tooMany.error?.issues[0]?.message).toBe('Upload up to 50 files at a time')
  })

  it('rejects non-image/video types', () => {
    for (const type of ['application/pdf', 'text/html', 'application/x-msdownload', '', 'image/*']) {
      const result = signUploadsSchema.safeParse({ files: [{ ...validFile, type }] })
      expect(result.success, type).toBe(false)
      expect(result.error?.issues[0]?.message, type).toBe('Only photos and videos can be uploaded')
    }
  })

  it('enforces the 4.5 GB size limit at the byte', () => {
    expect(MAX_FILE_SIZE_BYTES).toBe(4_831_838_208)
    expect(signUploadsSchema.safeParse({ files: [{ ...validFile, size: MAX_FILE_SIZE_BYTES }] }).success).toBe(true)
    const over = signUploadsSchema.safeParse({ files: [{ ...validFile, size: MAX_FILE_SIZE_BYTES + 1 }] })
    expect(over.success).toBe(false)
    expect(over.error?.issues[0]?.message).toBe('Each file must be 4.5 GB or smaller')
  })

  it('rejects empty, negative, fractional and non-numeric sizes', () => {
    for (const size of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, '100']) {
      expect(signUploadsSchema.safeParse({ files: [{ ...validFile, size }] }).success, String(size)).toBe(false)
    }
  })

  it('rejects missing or oversized filenames and names', () => {
    expect(signUploadsSchema.safeParse({ files: [{ ...validFile, filename: '' }] }).success).toBe(false)
    expect(signUploadsSchema.safeParse({ files: [{ ...validFile, filename: 'a'.repeat(256) }] }).success).toBe(false)
    expect(signUploadsSchema.safeParse({ name: 'n'.repeat(101), files: [validFile] }).success).toBe(false)
  })
})

describe('completeUploadSchema', () => {
  const key = buildUploadKey('Aunt Mary', 'a.jpg', DATE, UUID)

  it('accepts a key in the upload layout', () => {
    expect(completeUploadSchema.safeParse({ key, name: 'Aunt Mary', filename: 'a.jpg' }).success).toBe(true)
    expect(completeUploadSchema.safeParse({ key, filename: 'a.jpg' }).success).toBe(true)
  })

  it('rejects keys that point anywhere else in the bucket', () => {
    for (const badKey of ['film/final.mp4', '../' + key, key + '/../../x', '']) {
      const result = completeUploadSchema.safeParse({ key: badKey, filename: 'a.jpg' })
      expect(result.success, badKey).toBe(false)
    }
  })
})

describe('formatBytes', () => {
  it('formats across units', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(1023)).toBe('1023 B')
    expect(formatBytes(1024)).toBe('1.0 KB')
    expect(formatBytes(2_500_000)).toBe('2.4 MB')
    expect(formatBytes(150 * 1024 * 1024)).toBe('150 MB')
    expect(formatBytes(MAX_FILE_SIZE_BYTES)).toBe('4.5 GB')
  })
})

describe('groupUploadsByGuest', () => {
  function makeUpload(id: number, guestName: string | null, sizeBytes: number): GuestUpload {
    return {
      id,
      key: `guests/x/20260823/${UUID}-${id}.jpg`,
      guestName,
      filename: `${id}.jpg`,
      contentType: 'image/jpeg',
      sizeBytes,
      createdAt: DATE,
    }
  }

  it('groups case-insensitively, sums sizes and keeps first-seen order', () => {
    const groups = groupUploadsByGuest([
      makeUpload(1, 'Aunt Mary', 100),
      makeUpload(2, null, 10),
      makeUpload(3, 'aunt mary ', 50),
      makeUpload(4, '  ', 5),
      makeUpload(5, 'Bob', 1),
    ])
    expect(groups.map((g) => [g.guestName, g.uploads.map((u) => u.id), g.totalBytes])).toEqual([
      ['Aunt Mary', [1, 3], 150],
      [ANONYMOUS_GUEST_LABEL, [2, 4], 15],
      ['Bob', [5], 1],
    ])
  })

  it('returns no groups for no uploads', () => {
    expect(groupUploadsByGuest([])).toEqual([])
  })
})

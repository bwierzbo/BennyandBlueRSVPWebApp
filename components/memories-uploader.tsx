"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  MAX_FILES_PER_BATCH,
  MAX_FILE_SIZE_BYTES,
  MAX_GUEST_NAME_LENGTH,
  formatBytes,
  isAllowedMediaType,
  resolveContentType,
  type SignedUpload,
} from "@/lib/memories"

const CONCURRENT_UPLOADS = 3
// Presigned URLs last an hour; re-sign anything that waited in the queue longer than this
const SIGNED_URL_FRESH_MS = 50 * 60 * 1000

type UploadStatus = "queued" | "uploading" | "done" | "error"

interface UploadItem {
  id: string
  file: File
  contentType: string
  status: UploadStatus
  progress: number
  error?: string
}

// Per-file bookkeeping that never needs to trigger a render
interface UploadTicket extends SignedUpload {
  guestName: string
  signedAt: number
  isStored: boolean
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.error || "Something went wrong. Please try again.")
  }
  return data as T
}

export function MemoriesUploader() {
  const [guestName, setGuestName] = useState("")
  const [items, setItems] = useState<UploadItem[]>([])
  const [notices, setNotices] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const nameInputId = useId()
  const fileInputId = useId()

  const guestNameRef = useRef(guestName)
  const tickets = useRef(new Map<string, UploadTicket>())
  const queue = useRef<UploadItem[]>([])
  const activeCount = useRef(0)
  const requests = useRef(new Set<XMLHttpRequest>())
  const isMounted = useRef(true)

  useEffect(() => {
    guestNameRef.current = guestName
  }, [guestName])

  // Stop in-flight uploads when the guest leaves the page
  useEffect(() => {
    isMounted.current = true
    const inFlight = requests.current
    const pending = queue.current
    return () => {
      isMounted.current = false
      pending.length = 0
      inFlight.forEach((xhr) => xhr.abort())
      inFlight.clear()
    }
  }, [])

  const updateItem = useCallback((id: string, patch: Partial<UploadItem>) => {
    if (!isMounted.current) return
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }, [])

  const signItems = useCallback(async (batch: UploadItem[]) => {
    const name = guestNameRef.current.trim()
    const { uploads } = await postJson<{ uploads: SignedUpload[] }>("/api/memories/sign", {
      name: name || undefined,
      files: batch.map((item) => ({
        filename: item.file.name,
        type: item.contentType,
        size: item.file.size,
      })),
    })
    const signedAt = Date.now()
    batch.forEach((item, index) => {
      tickets.current.set(item.id, { ...uploads[index], guestName: name, signedAt, isStored: false })
    })
  }, [])

  const putFile = useCallback(
    (item: UploadItem, url: string) =>
      new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        requests.current.add(xhr)
        const finish = (error?: Error) => {
          requests.current.delete(xhr)
          if (error) reject(error)
          else resolve()
        }
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            updateItem(item.id, { progress: Math.round((event.loaded / event.total) * 100) })
          }
        }
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? finish()
            : finish(new Error(`Upload failed (${xhr.status}). Please retry.`))
        xhr.onerror = () => finish(new Error("Connection lost. Please retry."))
        xhr.onabort = () => finish(new Error("Upload cancelled."))
        xhr.open("PUT", url)
        xhr.setRequestHeader("Content-Type", item.contentType)
        xhr.send(item.file)
      }),
    [updateItem]
  )

  const uploadItem = useCallback(
    async (item: UploadItem) => {
      try {
        updateItem(item.id, { status: "uploading", error: undefined })

        let ticket = tickets.current.get(item.id)
        if (!ticket || (!ticket.isStored && Date.now() - ticket.signedAt > SIGNED_URL_FRESH_MS)) {
          await signItems([item])
          ticket = tickets.current.get(item.id)!
        }

        // A retry after a failed "complete" call must not re-send the file
        if (!ticket.isStored) {
          await putFile(item, ticket.url)
          ticket.isStored = true
        }

        await postJson("/api/memories/complete", {
          key: ticket.key,
          name: ticket.guestName || undefined,
          filename: item.file.name,
        })
        updateItem(item.id, { status: "done", progress: 100 })
      } catch (error) {
        updateItem(item.id, {
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed. Please retry.",
        })
      }
    },
    [putFile, signItems, updateItem]
  )

  const pump = useCallback(() => {
    while (isMounted.current && activeCount.current < CONCURRENT_UPLOADS && queue.current.length > 0) {
      const next = queue.current.shift()!
      activeCount.current++
      void uploadItem(next).finally(() => {
        activeCount.current--
        pump()
      })
    }
  }, [uploadItem])

  const enqueue = useCallback(
    async (batch: UploadItem[]) => {
      const unsigned = batch.filter((item) => !tickets.current.get(item.id)?.isStored)
      if (unsigned.length > 0) {
        try {
          await signItems(unsigned)
        } catch (error) {
          const message = error instanceof Error ? error.message : "Upload failed. Please retry."
          batch.forEach((item) => updateItem(item.id, { status: "error", error: message }))
          return
        }
      }
      if (!isMounted.current) return
      queue.current.push(...batch)
      pump()
    },
    [pump, signItems, updateItem]
  )

  const addFiles = useCallback(
    (selected: File[]) => {
      const nextNotices: string[] = []
      const accepted: UploadItem[] = []

      for (const file of selected) {
        const contentType = resolveContentType(file.name, file.type)
        if (!isAllowedMediaType(contentType)) {
          nextNotices.push(`${file.name} isn't a photo or video, so it was skipped.`)
        } else if (file.size === 0) {
          nextNotices.push(`${file.name} is empty, so it was skipped.`)
        } else if (file.size > MAX_FILE_SIZE_BYTES) {
          nextNotices.push(`${file.name} is larger than ${formatBytes(MAX_FILE_SIZE_BYTES)}, so it was skipped.`)
        } else if (accepted.length >= MAX_FILES_PER_BATCH) {
          nextNotices.push(
            `Only the first ${MAX_FILES_PER_BATCH} files were added. Add the rest once these finish.`
          )
          break
        } else {
          accepted.push({ id: crypto.randomUUID(), file, contentType, status: "queued", progress: 0 })
        }
      }

      setNotices(nextNotices)
      if (accepted.length === 0) return
      setItems((current) => [...current, ...accepted])
      void enqueue(accepted)
    },
    [enqueue]
  )

  const retry = useCallback(
    (item: UploadItem) => {
      updateItem(item.id, { status: "queued", progress: 0, error: undefined })
      void enqueue([item])
    },
    [enqueue, updateItem]
  )

  const doneCount = items.filter((item) => item.status === "done").length
  const isAllDone = items.length > 0 && doneCount === items.length

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor={nameInputId}>Your name (optional)</Label>
        <Input
          id={nameInputId}
          value={guestName}
          onChange={(event) => setGuestName(event.target.value)}
          maxLength={MAX_GUEST_NAME_LENGTH}
          autoComplete="name"
          placeholder="So we know who to thank"
        />
      </div>

      <div>
        <input
          id={fileInputId}
          type="file"
          multiple
          accept="image/*,video/*"
          className="peer sr-only"
          onChange={(event) => {
            addFiles(Array.from(event.target.files ?? []))
            // Let the same file be picked again after an error
            event.target.value = ""
          }}
        />
        <label
          htmlFor={fileInputId}
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setIsDragging(false)
            addFiles(Array.from(event.dataTransfer.files))
          }}
          className={cn(
            "flex min-h-[9rem] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-wedding-dustyPink-400 peer-focus-visible:ring-offset-2",
            isDragging
              ? "border-wedding-roseGold-500 bg-wedding-roseGold-50 dark:bg-gray-700"
              : "border-wedding-roseGold-300 bg-wedding-cream-200 hover:bg-wedding-cream-300 dark:border-wedding-roseGold-400/60 dark:bg-gray-900 dark:hover:bg-gray-700"
          )}
        >
          <svg className="h-9 w-9 text-wedding-roseGold-600 dark:text-wedding-roseGold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-display text-lg font-semibold text-wedding-deepPurple-900 dark:text-white">
            Choose photos &amp; videos
          </span>
          <span className="hidden text-sm text-gray-600 dark:text-gray-300 sm:block">
            or drag and drop them here
          </span>
        </label>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          Upload straight from your camera roll for full quality. On iPhone, choose &lsquo;Actual Size&rsquo; if asked.
        </p>
      </div>

      {notices.length > 0 && (
        <ul role="alert" className="space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-100">
          {notices.map((notice) => (
            <li key={notice} className="break-words">{notice}</li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200" aria-live="polite">
            {doneCount} of {items.length} uploaded
          </p>
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-wedding-dustyPink-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{item.file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatBytes(item.file.size)}</p>
                  </div>
                  {item.status === "done" && (
                    <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-green-700 dark:text-green-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Done
                    </span>
                  )}
                  {item.status === "queued" && (
                    <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400">Waiting…</span>
                  )}
                  {item.status === "uploading" && (
                    <span className="shrink-0 text-sm tabular-nums text-wedding-roseGold-700 dark:text-wedding-roseGold-400">
                      {item.progress}%
                    </span>
                  )}
                  {item.status === "error" && (
                    <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => retry(item)}>
                      Retry
                    </Button>
                  )}
                </div>
                {(item.status === "uploading" || item.status === "queued") && (
                  <div
                    role="progressbar"
                    aria-label={`Uploading ${item.file.name}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={item.progress}
                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-wedding-roseGold-100 dark:bg-gray-700"
                  >
                    <div
                      className="h-full rounded-full bg-wedding-roseGold-500 transition-[width] duration-200"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
                {item.status === "error" && (
                  <p role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {item.error}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isAllDone && (
        <p
          role="status"
          className="rounded-lg border border-wedding-roseGold-200 bg-wedding-roseGold-50 p-4 text-center font-display text-lg font-semibold text-wedding-deepPurple-900 dark:border-wedding-roseGold-400/40 dark:bg-gray-900 dark:text-white"
        >
          Thank you! Add more anytime.
        </p>
      )}
    </div>
  )
}

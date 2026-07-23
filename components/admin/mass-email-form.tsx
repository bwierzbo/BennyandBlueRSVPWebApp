'use client'

import { useMemo, useState } from 'react'
import type { RSVP } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Filter = 'all' | 'attending' | 'not_attending'

interface MassEmailFormProps {
  rsvps: RSVP[]
}

interface SendResult {
  attempted: number
  succeeded: number
  failed: number
  failures: Array<{ email: string; error: string }>
}

function uniqueEmails(rsvps: RSVP[], filter: Filter): string[] {
  const matched = rsvps.filter(r => {
    if (filter === 'attending') return r.isAttending
    if (filter === 'not_attending') return !r.isAttending
    return true
  })
  const seen = new Set<string>()
  const out: string[] = []
  for (const r of matched) {
    const key = r.email.trim().toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(r.email)
  }
  return out
}

export function MassEmailForm({ rsvps }: MassEmailFormProps) {
  const [filter, setFilter] = useState<Filter>('all')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; details?: SendResult } | null>(null)

  const recipients = useMemo(() => uniqueEmails(rsvps, filter), [rsvps, filter])
  const canSend = recipients.length > 0 && subject.trim().length > 0 && body.trim().length > 0

  const handleSend = async () => {
    setIsSending(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/mass-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filter,
          subject: subject.trim(),
          body: body.trim(),
        }),
      })
      const data = await response.json()

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: `Sent to ${data.succeeded} of ${data.attempted} recipient${data.attempted === 1 ? '' : 's'}.`,
          details: data,
        })
        setSubject('')
        setBody('')
      } else if (response.ok) {
        setResult({
          success: false,
          message: `${data.succeeded} sent, ${data.failed} failed. See details below.`,
          details: data,
        })
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to send emails',
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      })
    } finally {
      setIsSending(false)
      setConfirming(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Send Mass Email</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Sends the same email to every recipient individually (not BCC, so recipients don&apos;t see each other).
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Recipients</legend>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="all"
              checked={filter === 'all'}
              onChange={() => setFilter('all')}
              disabled={isSending}
            />
            <span className="text-sm">All ({uniqueEmails(rsvps, 'all').length})</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="attending"
              checked={filter === 'attending'}
              onChange={() => setFilter('attending')}
              disabled={isSending}
            />
            <span className="text-sm">Attending only ({uniqueEmails(rsvps, 'attending').length})</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="not_attending"
              checked={filter === 'not_attending'}
              onChange={() => setFilter('not_attending')}
              disabled={isSending}
            />
            <span className="text-sm">Not attending only ({uniqueEmails(rsvps, 'not_attending').length})</span>
          </label>
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="mass-subject">Subject</Label>
        <Input
          id="mass-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={200}
          disabled={isSending}
          placeholder="Wedding update..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mass-body">Message</Label>
        <Textarea
          id="mass-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={10000}
          disabled={isSending}
          rows={10}
          placeholder="Hi everyone,&#10;&#10;Just a quick update about..."
        />
        <p className="text-xs text-gray-500">
          Line breaks are preserved. Blank lines create paragraphs. {body.length}/10000
        </p>
      </div>

      {result && (
        <div
          className={`p-4 rounded-lg text-sm ${
            result.success
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}
        >
          <p>{result.message}</p>
          {result.details?.failures && result.details.failures.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer">Show failures ({result.details.failures.length})</summary>
              <ul className="mt-2 space-y-1 max-h-40 overflow-auto">
                {result.details.failures.map((f, i) => (
                  <li key={i}><code className="text-xs">{f.email}</code>: {f.error}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {confirming ? (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg space-y-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Send &quot;<strong>{subject.trim()}</strong>&quot; to <strong>{recipients.length}</strong> recipient
            {recipients.length === 1 ? '' : 's'}?
          </p>
          {recipients.length > 0 && (
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              First few: {recipients.slice(0, 3).join(', ')}
              {recipients.length > 3 ? ` (+${recipients.length - 3} more)` : ''}
            </p>
          )}
          <div className="flex gap-2">
            <Button onClick={handleSend} disabled={isSending}>
              {isSending ? 'Sending...' : `Yes, send to ${recipients.length}`}
            </Button>
            <Button variant="outline" onClick={() => setConfirming(false)} disabled={isSending}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setConfirming(true)}
          disabled={!canSend || isSending}
          className="w-full sm:w-auto"
        >
          Review &amp; Send to {recipients.length} recipient{recipients.length === 1 ? '' : 's'}
        </Button>
      )}
    </div>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import type { RSVP } from '@/types'

interface ExportRSVPButtonProps {
  rsvps: RSVP[]
}

// Escape a value for safe inclusion in a CSV cell
function escapeCsvValue(value: string): string {
  // Wrap in quotes and double any embedded quotes if the value contains
  // a comma, quote, or newline
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildCsv(rsvps: RSVP[]): string {
  const headers = [
    'Name',
    'Email',
    'Attending',
    'Party Size',
    'Additional Guests',
    'Guest Names',
    'Dietary Restrictions',
    'Song Requests',
    'Notes',
    'Submitted At',
  ]

  const rows = rsvps.map((rsvp) => {
    // Party size includes the RSVP submitter when attending
    const partySize = rsvp.isAttending ? rsvp.numberOfGuests + 1 : 0

    return [
      rsvp.name,
      rsvp.email,
      rsvp.isAttending ? 'Yes' : 'No',
      String(partySize),
      String(rsvp.numberOfGuests),
      (rsvp.guestNames ?? []).join('; '),
      rsvp.dietaryRestrictions ?? '',
      rsvp.songRequests ?? '',
      rsvp.notes ?? '',
      formatDate(rsvp.createdAt),
    ]
      .map(escapeCsvValue)
      .join(',')
  })

  return [headers.join(','), ...rows].join('\r\n')
}

export function ExportRSVPButton({ rsvps }: ExportRSVPButtonProps) {
  const handleExport = () => {
    const csv = buildCsv(rsvps)
    // Prepend BOM so Excel reads UTF-8 characters correctly
    const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const today = new Date().toISOString().split('T')[0]
    const link = document.createElement('a')
    link.href = url
    link.download = `rsvp-list-${today}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      size="sm"
      disabled={rsvps.length === 0}
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Export CSV
    </Button>
  )
}

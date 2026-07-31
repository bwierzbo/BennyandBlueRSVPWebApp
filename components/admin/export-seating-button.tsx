"use client"

import { Button } from '@/components/ui/button'
import { escapeCsvValue } from '@/lib/utils'
import type { SeatingPlan } from '@/types'

interface ExportSeatingButtonProps {
  plan: SeatingPlan
}

function buildCsv(plan: SeatingPlan): string {
  const headers = ['Table', 'Guest', 'Party', 'Role', 'Dietary Restrictions']
  const rows: string[] = []

  for (const table of plan.tables) {
    for (const person of table.people) {
      rows.push(
        [
          table.name,
          person.name,
          person.partyName,
          person.isPrimary ? 'RSVP contact' : 'Plus one',
          person.dietaryRestrictions ?? '',
        ]
          .map(escapeCsvValue)
          .join(',')
      )
    }
  }

  for (const party of plan.unseatedParties) {
    for (const person of party.people) {
      rows.push(
        [
          'Unseated',
          person.name,
          person.partyName,
          person.isPrimary ? 'RSVP contact' : 'Plus one',
          person.dietaryRestrictions ?? '',
        ]
          .map(escapeCsvValue)
          .join(',')
      )
    }
  }

  return [headers.join(','), ...rows].join('\r\n')
}

export function ExportSeatingButton({ plan }: ExportSeatingButtonProps) {
  const handleExport = () => {
    const csv = buildCsv(plan)
    // Prepend BOM so Excel reads UTF-8 characters correctly
    const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const today = new Date().toISOString().split('T')[0]
    const link = document.createElement('a')
    link.href = url
    link.download = `seating-chart-${today}.csv`
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
      disabled={plan.totalAttendees === 0}
      className="h-9 px-3 text-xs"
    >
      Export CSV
    </Button>
  )
}

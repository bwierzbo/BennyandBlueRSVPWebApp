"use client"

import { useMemo, useState, type ReactNode } from 'react'
import type { RSVP } from '@/types'
import { Input } from '@/components/ui/input'
import { calculateTotalGuests } from '@/lib/utils'
import { RSVPCard } from './rsvp-card'

interface SearchableGuestListProps {
  rsvps: RSVP[]
  totalGuests: number
  actions?: ReactNode
}

function matchesQuery(rsvp: RSVP, query: string): boolean {
  const haystack = [
    rsvp.name,
    rsvp.email,
    ...(rsvp.guestNames ?? []),
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(query)
}

export function SearchableGuestList({ rsvps, totalGuests, actions }: SearchableGuestListProps) {
  const [search, setSearch] = useState('')

  const trimmed = search.trim().toLowerCase()

  const filteredRsvps = useMemo(() => {
    if (!trimmed) return rsvps
    return rsvps.filter((rsvp) => matchesQuery(rsvp, trimmed))
  }, [rsvps, trimmed])

  const filteredGuestTotal = useMemo(
    () => calculateTotalGuests(filteredRsvps),
    [filteredRsvps]
  )

  const isFiltered = trimmed.length > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          All RSVP Submissions ({filteredRsvps.length}
          {isFiltered ? ` of ${rsvps.length}` : ''})
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isFiltered ? (
              <>
                Filtered guests: <span className="font-semibold text-gray-900 dark:text-white">{filteredGuestTotal}</span>
                {' '}of {totalGuests}
              </>
            ) : (
              <>
                Total guests: <span className="font-semibold text-gray-900 dark:text-white">{totalGuests}</span>
              </>
            )}
          </div>
          {actions}
        </div>
      </div>

      <div>
        <label htmlFor="rsvp-search" className="sr-only">
          Search RSVPs
        </label>
        <Input
          id="rsvp-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or guest name..."
          autoComplete="off"
        />
      </div>

      {filteredRsvps.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            {isFiltered
              ? `No RSVPs match "${search.trim()}".`
              : 'No RSVP submissions yet.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-1">
          {filteredRsvps.map((rsvp) => (
            <RSVPCard key={rsvp.id} rsvp={rsvp} />
          ))}
        </div>
      )}
    </div>
  )
}

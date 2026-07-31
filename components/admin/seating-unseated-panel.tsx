"use client"

import type { DragEvent } from 'react'
import type { SeatingParty, SeatingTableWithPeople } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { partyColorClasses } from '@/lib/seating'
import { cn } from '@/lib/utils'
import { SeatingPersonChip } from './seating-person-chip'

interface SeatingUnseatedPanelProps {
  // Parties holding at least one unseated person; `people` is the unseated subset
  parties: SeatingParty[]
  tables: SeatingTableWithPeople[]
  selectedIds: Set<string>
  search: string
  disabled: boolean
  unseatedCount: number
  onSearchChange: (value: string) => void
  onTogglePerson: (personId: string) => void
  onToggleParty: (party: SeatingParty) => void
  onSeatParty: (party: SeatingParty, tableId: number) => void
  onDragStartPerson: (personId: string, event: DragEvent<HTMLElement>) => void
  onDragStartParty: (party: SeatingParty, event: DragEvent<HTMLElement>) => void
  onDropUnseat: (event: DragEvent<HTMLElement>) => void
  onSelectAllVisible: () => void
}

export function SeatingUnseatedPanel({
  parties,
  tables,
  selectedIds,
  search,
  disabled,
  unseatedCount,
  onSearchChange,
  onTogglePerson,
  onToggleParty,
  onSeatParty,
  onDragStartPerson,
  onDragStartParty,
  onDropUnseat,
  onSelectAllVisible,
}: SeatingUnseatedPanelProps) {
  const visibleCount = parties.reduce((sum, party) => sum + party.people.length, 0)
  const isFiltered = search.trim().length > 0

  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDropUnseat}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4"
    >
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Not seated</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {isFiltered ? `${visibleCount} of ${unseatedCount}` : unseatedCount} people
        </span>
      </div>

      <div className="space-y-2 mb-4 print:hidden">
        <label htmlFor="seating-search" className="sr-only">
          Search unseated guests
        </label>
        <Input
          id="seating-search"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search name, email, or guest..."
          autoComplete="off"
        />
        {visibleCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={onSelectAllVisible}
            disabled={disabled}
            className="h-8 w-full px-2 text-xs"
          >
            Select all {isFiltered ? 'matching' : ''} ({visibleCount})
          </Button>
        )}
      </div>

      {parties.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          {isFiltered
            ? `No unseated guests match “${search.trim()}”.`
            : unseatedCount === 0
              ? '🎉 Everyone has a seat. Drag a guest here to unseat them.'
              : 'No unseated guests.'}
        </p>
      ) : (
        <ul className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {parties.map((party) => {
            const allSelected = party.people.every((person) => selectedIds.has(person.personId))
            const seatedElsewhere = party.size - party.people.length

            return (
              <li
                key={party.rsvpId}
                draggable={!disabled}
                onDragStart={(event) => onDragStartParty(party, event)}
                className={cn(
                  'rounded-lg border p-2.5 cursor-grab active:cursor-grabbing',
                  partyColorClasses(party.rsvpId),
                  allSelected && 'ring-2 ring-blue-500'
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{party.name}</p>
                    <p className="text-xs opacity-75">
                      {party.people.length} of {party.size} {party.size === 1 ? 'person' : 'people'}
                      {seatedElsewhere > 0 ? ` · ${seatedElsewhere} already seated` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleParty(party)}
                    disabled={disabled}
                    className="shrink-0 rounded border border-current/30 px-2 py-1 text-xs font-medium hover:bg-white/50 dark:hover:bg-black/20 disabled:opacity-50 print:hidden"
                  >
                    {allSelected ? 'Deselect' : 'Select party'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {party.people.map((person) => (
                    <SeatingPersonChip
                      key={person.personId}
                      person={person}
                      selected={selectedIds.has(person.personId)}
                      disabled={disabled}
                      onToggleSelect={onTogglePerson}
                      onDragStart={onDragStartPerson}
                    />
                  ))}
                </div>

                {party.dietaryRestrictions && (
                  <p className="mb-2 text-xs opacity-75">🍽 {party.dietaryRestrictions}</p>
                )}

                {tables.length > 0 && (
                  <label className="block print:hidden">
                    <span className="sr-only">Seat {party.name} at a table</span>
                    <select
                      value=""
                      disabled={disabled}
                      onChange={(event) => {
                        const tableId = Number(event.target.value)
                        if (tableId) onSeatParty(party, tableId)
                      }}
                      className="w-full rounded border border-current/30 bg-white/70 dark:bg-black/20 px-2 py-1 text-xs disabled:opacity-50"
                    >
                      <option value="">Seat whole party at…</option>
                      {tables.map((table) => (
                        <option key={table.id} value={table.id}>
                          {table.name} — {table.seatsLeft} free
                          {table.seatsLeft < party.people.length ? ' (tight fit)' : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

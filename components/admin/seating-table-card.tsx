"use client"

import { useEffect, useState, type DragEvent } from 'react'
import type { SeatingTableWithPeople } from '@/types'
import { Button } from '@/components/ui/button'
import { SEATING_MAX_CAPACITY } from '@/lib/seating'
import { cn } from '@/lib/utils'
import { SeatingPersonChip } from './seating-person-chip'

interface SeatingTableCardProps {
  table: SeatingTableWithPeople
  selectedIds: Set<string>
  selectedCount: number
  isDropTarget: boolean
  disabled: boolean
  onRename: (tableId: number, name: string) => void
  onCapacityChange: (tableId: number, capacity: number) => void
  onDelete: (tableId: number) => void
  onSeatSelected: (tableId: number) => void
  onClearTable: (tableId: number) => void
  onTogglePerson: (personId: string) => void
  onRemovePerson: (personId: string) => void
  onDragStartPerson: (personId: string, event: DragEvent<HTMLElement>) => void
  onDropOnTable: (tableId: number, event: DragEvent<HTMLElement>) => void
  onDragOverTable: (tableId: number) => void
  onDragLeaveTable: () => void
}

export function SeatingTableCard({
  table,
  selectedIds,
  selectedCount,
  isDropTarget,
  disabled,
  onRename,
  onCapacityChange,
  onDelete,
  onSeatSelected,
  onClearTable,
  onTogglePerson,
  onRemovePerson,
  onDragStartPerson,
  onDropOnTable,
  onDragOverTable,
  onDragLeaveTable,
}: SeatingTableCardProps) {
  const [name, setName] = useState(table.name)
  const [capacity, setCapacity] = useState(String(table.capacity))
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  // Keep the inputs in step when the table changes underneath us
  useEffect(() => setName(table.name), [table.name])
  useEffect(() => setCapacity(String(table.capacity)), [table.capacity])

  const commitName = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setName(table.name)
      return
    }
    if (trimmed !== table.name) {
      onRename(table.id, trimmed)
    }
  }

  const commitCapacity = () => {
    const parsed = Number(capacity)
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > SEATING_MAX_CAPACITY) {
      setCapacity(String(table.capacity))
      return
    }
    if (parsed !== table.capacity) {
      onCapacityChange(table.id, parsed)
    }
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        onDragOverTable(table.id)
      }}
      onDragLeave={onDragLeaveTable}
      onDrop={(event) => onDropOnTable(table.id, event)}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 p-4 transition-colors break-inside-avoid',
        isDropTarget
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : table.isOverCapacity
            ? 'border-red-400 dark:border-red-600'
            : 'border-gray-200 dark:border-gray-700'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          onBlur={commitName}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur()
            if (event.key === 'Escape') setName(table.name)
          }}
          disabled={disabled}
          maxLength={100}
          aria-label="Table name"
          className="flex-1 min-w-0 bg-transparent text-lg font-semibold text-gray-900 dark:text-white border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-0.5"
        />

        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 print:hidden">
          <span
            className={cn(
              'font-semibold',
              table.isOverCapacity ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
            )}
          >
            {table.seatsUsed}
          </span>
          <span>/</span>
          <input
            type="number"
            min={1}
            max={SEATING_MAX_CAPACITY}
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
            onBlur={commitCapacity}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur()
              if (event.key === 'Escape') setCapacity(String(table.capacity))
            }}
            disabled={disabled}
            aria-label={`Seats at ${table.name}`}
            className="w-14 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-1 py-0.5 text-center text-gray-900 dark:text-white"
          />
        </div>
        <span className="hidden print:inline text-sm">
          {table.seatsUsed}/{table.capacity} seats
        </span>
      </div>

      {table.isOverCapacity && (
        <p className="mb-2 text-xs font-medium text-red-600 dark:text-red-400">
          {table.seatsUsed - table.capacity} over capacity
        </p>
      )}

      {table.people.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
          Drop a party here, or use “Seat selected”
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {table.people.map((person) => (
            <SeatingPersonChip
              key={person.personId}
              person={person}
              selected={selectedIds.has(person.personId)}
              showParty
              disabled={disabled}
              onToggleSelect={onTogglePerson}
              onDragStart={onDragStartPerson}
              onRemove={onRemovePerson}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700 print:hidden">
        <Button
          size="sm"
          variant="secondary"
          disabled={disabled || selectedCount === 0}
          onClick={() => onSeatSelected(table.id)}
          className="h-8 px-2 text-xs"
        >
          Seat selected{selectedCount > 0 ? ` (${selectedCount})` : ''}
        </Button>

        {table.people.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            disabled={disabled}
            onClick={() => onClearTable(table.id)}
            className="h-8 px-2 text-xs"
          >
            Empty table
          </Button>
        )}

        <div className="ml-auto">
          {confirmingDelete ? (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="destructive"
                disabled={disabled}
                onClick={() => {
                  setConfirmingDelete(false)
                  onDelete(table.id)
                }}
                className="h-8 px-2 text-xs"
              >
                Delete table
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmingDelete(false)}
                className="h-8 px-2 text-xs"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              disabled={disabled}
              onClick={() => setConfirmingDelete(true)}
              className="h-8 px-2 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {table.partyCount > 0 && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {table.partyCount} {table.partyCount === 1 ? 'party' : 'parties'} · {table.seatsLeft >= 0 ? `${table.seatsLeft} seat${table.seatsLeft === 1 ? '' : 's'} free` : 'full'}
        </p>
      )}
    </div>
  )
}

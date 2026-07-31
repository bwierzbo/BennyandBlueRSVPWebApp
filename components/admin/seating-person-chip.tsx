"use client"

import type { DragEvent } from 'react'
import type { SeatingPerson } from '@/types'
import { partyColorClasses } from '@/lib/seating'
import { cn } from '@/lib/utils'

interface SeatingPersonChipProps {
  person: SeatingPerson
  selected: boolean
  // Show which party the person belongs to (used on table cards)
  showParty?: boolean
  onToggleSelect: (personId: string) => void
  onDragStart: (personId: string, event: DragEvent<HTMLElement>) => void
  onRemove?: (personId: string) => void
  disabled?: boolean
}

export function SeatingPersonChip({
  person,
  selected,
  showParty = false,
  onToggleSelect,
  onDragStart,
  onRemove,
  disabled = false,
}: SeatingPersonChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border text-xs transition-shadow',
        partyColorClasses(person.rsvpId),
        selected && 'ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-gray-800',
        disabled && 'opacity-60'
      )}
    >
      <button
        type="button"
        draggable={!disabled}
        onDragStart={(event) => onDragStart(person.personId, event)}
        onClick={() => onToggleSelect(person.personId)}
        disabled={disabled}
        aria-pressed={selected}
        title={
          person.dietaryRestrictions
            ? `Dietary: ${person.dietaryRestrictions}`
            : 'Click to select, or drag to a table'
        }
        className="flex items-center gap-1 px-2.5 py-1 cursor-grab active:cursor-grabbing disabled:cursor-not-allowed max-w-[16rem]"
      >
        {person.isPrimary && (
          <span aria-hidden="true" className="opacity-70">
            ★
          </span>
        )}
        <span className={cn('truncate', !person.isNamed && 'italic opacity-80')}>{person.name}</span>
        {person.dietaryRestrictions && (
          <span aria-label="Has dietary restrictions" title={`Dietary: ${person.dietaryRestrictions}`}>
            🍽
          </span>
        )}
        {showParty && !person.isPrimary && (
          <span className="opacity-70 truncate">· {person.partyName}</span>
        )}
      </button>

      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(person.personId)}
          disabled={disabled}
          aria-label={`Remove ${person.name} from this table`}
          title="Remove from table"
          className="pr-2 pl-0.5 py-1 opacity-60 hover:opacity-100 disabled:cursor-not-allowed print:hidden"
        >
          ✕
        </button>
      )}
    </span>
  )
}

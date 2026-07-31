"use client"

import { useCallback, useMemo, useState, type DragEvent } from 'react'
import type { RSVP, SeatingAssignmentMap, SeatingParty, SeatingTable } from '@/types'
import type { ValidationResult } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import {
  SEATING_DEFAULT_CAPACITY,
  buildParties,
  buildSeatingPlan,
} from '@/lib/seating'
import {
  autoSeatAction,
  clearSeatingAction,
  createSeatingTableAction,
  deleteSeatingTableAction,
  seatPeopleAction,
  unseatPeopleAction,
  updateSeatingTableAction,
} from '@/lib/seating-actions'
import { SeatingTableCard } from './seating-table-card'
import { SeatingUnseatedPanel } from './seating-unseated-panel'
import { ExportSeatingButton } from './export-seating-button'

interface SeatingPlannerProps {
  rsvps: RSVP[]
  initialTables: SeatingTable[]
  initialAssignments: SeatingAssignmentMap
}

const DRAG_MIME = 'text/plain'

function matchesSearch(party: SeatingParty, query: string): boolean {
  const haystack = [party.name, party.email, ...party.people.map((person) => person.name)]
    .join(' ')
    .toLowerCase()
  return haystack.includes(query)
}

export function SeatingPlanner({ rsvps, initialTables, initialAssignments }: SeatingPlannerProps) {
  const [tables, setTables] = useState<SeatingTable[]>(initialTables)
  const [assignments, setAssignments] = useState<SeatingAssignmentMap>(initialAssignments)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [dropTargetId, setDropTargetId] = useState<number | null>(null)
  const [confirmingClear, setConfirmingClear] = useState(false)
  const [newTableCount, setNewTableCount] = useState('10')
  const [newTableCapacity, setNewTableCapacity] = useState(String(SEATING_DEFAULT_CAPACITY))

  const isSaving = pendingCount > 0

  const parties = useMemo(() => buildParties(rsvps), [rsvps])
  const plan = useMemo(() => buildSeatingPlan(parties, tables, assignments), [parties, tables, assignments])

  const trimmedSearch = search.trim().toLowerCase()
  const visibleUnseated = useMemo(() => {
    if (!trimmedSearch) return plan.unseatedParties
    return plan.unseatedParties.filter((party) => matchesSearch(party, trimmedSearch))
  }, [plan.unseatedParties, trimmedSearch])

  // Run a server action, rolling the optimistic update back if it fails
  const save = useCallback(
    async <T,>(
      call: () => Promise<ValidationResult<T>>,
      rollback: () => void,
      fallbackMessage: string
    ): Promise<T | undefined> => {
      setPendingCount((count) => count + 1)
      try {
        const result = await call()
        if (!result.success) {
          rollback()
          setError(result.errors?.[0]?.message ?? fallbackMessage)
          return undefined
        }
        setError(null)
        return result.data
      } catch (err) {
        console.error(err)
        rollback()
        setError(fallbackMessage)
        return undefined
      } finally {
        setPendingCount((count) => count - 1)
      }
    },
    []
  )

  const deselect = useCallback((personIds: string[]) => {
    setSelected((previous) => {
      const next = new Set(previous)
      for (const personId of personIds) {
        next.delete(personId)
      }
      return next
    })
  }, [])

  const seatPeople = useCallback(
    async (personIds: string[], tableId: number) => {
      if (personIds.length === 0) return

      const snapshot = assignments
      setAssignments((previous) => {
        const next = { ...previous }
        for (const personId of personIds) {
          next[personId] = tableId
        }
        return next
      })
      deselect(personIds)
      setNotice(null)

      await save(
        () => seatPeopleAction(personIds, tableId),
        () => setAssignments(snapshot),
        'Failed to seat guests'
      )
    },
    [assignments, deselect, save]
  )

  const unseatPeople = useCallback(
    async (personIds: string[]) => {
      if (personIds.length === 0) return

      const snapshot = assignments
      setAssignments((previous) => {
        const next = { ...previous }
        for (const personId of personIds) {
          delete next[personId]
        }
        return next
      })
      deselect(personIds)
      setNotice(null)

      await save(
        () => unseatPeopleAction(personIds),
        () => setAssignments(snapshot),
        'Failed to unseat guests'
      )
    },
    [assignments, deselect, save]
  )

  const togglePerson = useCallback((personId: string) => {
    setSelected((previous) => {
      const next = new Set(previous)
      if (next.has(personId)) {
        next.delete(personId)
      } else {
        next.add(personId)
      }
      return next
    })
  }, [])

  const toggleParty = useCallback((party: SeatingParty) => {
    setSelected((previous) => {
      const next = new Set(previous)
      const allSelected = party.people.every((person) => next.has(person.personId))
      for (const person of party.people) {
        if (allSelected) {
          next.delete(person.personId)
        } else {
          next.add(person.personId)
        }
      }
      return next
    })
  }, [])

  const selectAllVisible = useCallback(() => {
    setSelected((previous) => {
      const next = new Set(previous)
      for (const party of visibleUnseated) {
        for (const person of party.people) {
          next.add(person.personId)
        }
      }
      return next
    })
  }, [visibleUnseated])

  // Dragging a selected chip carries the whole selection with it
  const handleDragStartPerson = useCallback(
    (personId: string, event: DragEvent<HTMLElement>) => {
      const payload = selected.has(personId) ? Array.from(selected) : [personId]
      event.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload))
      event.dataTransfer.effectAllowed = 'move'
    },
    [selected]
  )

  const handleDragStartParty = useCallback((party: SeatingParty, event: DragEvent<HTMLElement>) => {
    const payload = party.people.map((person) => person.personId)
    event.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload))
    event.dataTransfer.effectAllowed = 'move'
  }, [])

  const readDragPayload = (event: DragEvent<HTMLElement>): string[] => {
    try {
      const raw = event.dataTransfer.getData(DRAG_MIME)
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
    } catch {
      return []
    }
  }

  const handleDropOnTable = useCallback(
    (tableId: number, event: DragEvent<HTMLElement>) => {
      event.preventDefault()
      setDropTargetId(null)
      const personIds = readDragPayload(event)
      // Skip anyone already sitting here
      const toMove = personIds.filter((personId) => assignments[personId] !== tableId)
      void seatPeople(toMove, tableId)
    },
    [assignments, seatPeople]
  )

  const handleDropUnseat = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault()
      setDropTargetId(null)
      const personIds = readDragPayload(event).filter((personId) => assignments[personId] !== undefined)
      void unseatPeople(personIds)
    },
    [assignments, unseatPeople]
  )

  const addTables = useCallback(
    async (count: number, capacity: number) => {
      const safeCount = Math.min(Math.max(1, Math.floor(count)), 40)
      setNotice(null)

      for (let i = 0; i < safeCount; i++) {
        const created = await save(
          () => createSeatingTableAction({ capacity }),
          () => {},
          'Failed to add table'
        )
        if (!created) break
        setTables((previous) => [...previous, created])
      }
    },
    [save]
  )

  const renameTable = useCallback(
    async (tableId: number, name: string) => {
      const snapshot = tables
      setTables((previous) =>
        previous.map((table) => (table.id === tableId ? { ...table, name } : table))
      )
      await save(
        () => updateSeatingTableAction(tableId, { name }),
        () => setTables(snapshot),
        'Failed to rename table'
      )
    },
    [tables, save]
  )

  const changeCapacity = useCallback(
    async (tableId: number, capacity: number) => {
      const snapshot = tables
      setTables((previous) =>
        previous.map((table) => (table.id === tableId ? { ...table, capacity } : table))
      )
      await save(
        () => updateSeatingTableAction(tableId, { capacity }),
        () => setTables(snapshot),
        'Failed to update seats'
      )
    },
    [tables, save]
  )

  const deleteTable = useCallback(
    async (tableId: number) => {
      const tableSnapshot = tables
      const assignmentSnapshot = assignments

      setTables((previous) => previous.filter((table) => table.id !== tableId))
      // Everyone seated there goes back to the unseated list
      setAssignments((previous) => {
        const next: SeatingAssignmentMap = {}
        for (const [personId, id] of Object.entries(previous)) {
          if (id !== tableId) next[personId] = id
        }
        return next
      })

      await save(
        () => deleteSeatingTableAction(tableId),
        () => {
          setTables(tableSnapshot)
          setAssignments(assignmentSnapshot)
        },
        'Failed to delete table'
      )
    },
    [tables, assignments, save]
  )

  const clearTable = useCallback(
    (tableId: number) => {
      const personIds = Object.entries(assignments)
        .filter(([, id]) => id === tableId)
        .map(([personId]) => personId)
      void unseatPeople(personIds)
    },
    [assignments, unseatPeople]
  )

  const autoSeat = useCallback(async () => {
    const snapshot = assignments
    setNotice(null)

    const data = await save(
      () => autoSeatAction(),
      () => setAssignments(snapshot),
      'Failed to auto-seat guests'
    )

    if (data) {
      setAssignments(data.assignments)
      setSelected(new Set())
      if (data.unplacedPartyNames.length > 0) {
        setNotice(
          `No table had room for ${data.unplacedPartyNames.length} ${
            data.unplacedPartyNames.length === 1 ? 'party' : 'parties'
          }: ${data.unplacedPartyNames.join(', ')}. Add a table or free up seats.`
        )
      } else {
        setNotice('Everyone has a seat.')
      }
    }
  }, [assignments, save])

  const clearAll = useCallback(async () => {
    const snapshot = assignments
    setConfirmingClear(false)
    setAssignments({})
    setSelected(new Set())
    setNotice(null)

    await save(
      () => clearSeatingAction(),
      () => setAssignments(snapshot),
      'Failed to clear the seating chart'
    )
  }, [assignments, save])

  const selectedCount = selected.size
  const seatedPercent =
    plan.totalAttendees > 0 ? Math.round((plan.seatedCount / plan.totalAttendees) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Summary + global actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Seated</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {plan.seatedCount}
                <span className="text-base font-normal text-gray-500 dark:text-gray-400">
                  {' '}/ {plan.totalAttendees}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tables</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{tables.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total seats</p>
              <p
                className={`text-2xl font-bold ${
                  plan.totalCapacity < plan.totalAttendees
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                {plan.totalCapacity}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button
              size="sm"
              onClick={autoSeat}
              disabled={isSaving || tables.length === 0 || plan.unseatedCount === 0}
              className="h-9 px-3 text-xs"
            >
              Auto-seat remaining
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addTables(1, Number(newTableCapacity) || SEATING_DEFAULT_CAPACITY)}
              disabled={isSaving}
              className="h-9 px-3 text-xs"
            >
              + Add table
            </Button>
            <ExportSeatingButton plan={plan} />
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="h-9 px-3 text-xs"
            >
              Print
            </Button>
            {confirmingClear ? (
              <span className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={clearAll}
                  disabled={isSaving}
                  className="h-9 px-3 text-xs"
                >
                  Confirm clear
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmingClear(false)}
                  className="h-9 px-3 text-xs"
                >
                  Cancel
                </Button>
              </span>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmingClear(true)}
                disabled={isSaving || plan.seatedCount === 0}
                className="h-9 px-3 text-xs"
              >
                Clear seating
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
            style={{ width: `${seatedPercent}%` }}
          />
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span>{seatedPercent}% seated</span>
          {isSaving && <span className="text-blue-600 dark:text-blue-400">Saving…</span>}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
          {notice}
        </div>
      )}

      {/* Selection action bar */}
      {selectedCount > 0 && (
        <div className="sticky top-2 z-10 flex flex-wrap items-center gap-3 rounded-lg border border-blue-300 bg-blue-50 p-3 shadow-md dark:border-blue-700 dark:bg-blue-900/30 print:hidden">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {selectedCount} selected
          </span>

          <label className="flex items-center gap-2 text-sm">
            <span className="sr-only">Seat selected guests at</span>
            <select
              value=""
              disabled={isSaving || tables.length === 0}
              onChange={(event) => {
                const tableId = Number(event.target.value)
                if (tableId) void seatPeople(Array.from(selected), tableId)
              }}
              className="rounded border border-blue-300 bg-white px-2 py-1.5 text-sm dark:border-blue-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Seat selected at…</option>
              {plan.tables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name} — {table.seatsLeft} free
                </option>
              ))}
            </select>
          </label>

          <Button
            size="sm"
            variant="outline"
            disabled={isSaving}
            onClick={() => void unseatPeople(Array.from(selected))}
            className="h-9 px-3 text-xs"
          >
            Unseat
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelected(new Set())}
            className="h-9 px-3 text-xs"
          >
            Clear selection
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[22rem_1fr] gap-6 items-start">
        <SeatingUnseatedPanel
          parties={visibleUnseated}
          tables={plan.tables}
          selectedIds={selected}
          search={search}
          disabled={isSaving}
          unseatedCount={plan.unseatedCount}
          onSearchChange={setSearch}
          onTogglePerson={togglePerson}
          onToggleParty={toggleParty}
          onSeatParty={(party, tableId) =>
            void seatPeople(
              party.people.map((person) => person.personId),
              tableId
            )
          }
          onDragStartPerson={handleDragStartPerson}
          onDragStartParty={handleDragStartParty}
          onDropUnseat={handleDropUnseat}
          onSelectAllVisible={selectAllVisible}
        />

        <div>
          {tables.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 text-center dark:border-gray-600 dark:bg-gray-800">
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                No tables yet
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Create your tables, then drag parties onto them or use “Auto-seat remaining”.
              </p>
              <div className="flex flex-wrap items-end justify-center gap-3">
                <label className="text-left text-xs text-gray-600 dark:text-gray-400">
                  How many tables
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={newTableCount}
                    onChange={(event) => setNewTableCount(event.target.value)}
                    className="mt-1 block w-24 rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </label>
                <label className="text-left text-xs text-gray-600 dark:text-gray-400">
                  Seats each
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={newTableCapacity}
                    onChange={(event) => setNewTableCapacity(event.target.value)}
                    className="mt-1 block w-24 rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </label>
                <Button
                  size="sm"
                  disabled={isSaving}
                  onClick={() =>
                    addTables(
                      Number(newTableCount) || 1,
                      Number(newTableCapacity) || SEATING_DEFAULT_CAPACITY
                    )
                  }
                  className="h-9 px-4 text-xs"
                >
                  {isSaving ? 'Creating…' : 'Create tables'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
              {plan.tables.map((table) => (
                <SeatingTableCard
                  key={table.id}
                  table={table}
                  selectedIds={selected}
                  selectedCount={selectedCount}
                  isDropTarget={dropTargetId === table.id}
                  disabled={isSaving}
                  onRename={renameTable}
                  onCapacityChange={changeCapacity}
                  onDelete={deleteTable}
                  onSeatSelected={(tableId) => void seatPeople(Array.from(selected), tableId)}
                  onClearTable={clearTable}
                  onTogglePerson={togglePerson}
                  onRemovePerson={(personId) => void unseatPeople([personId])}
                  onDragStartPerson={handleDragStartPerson}
                  onDropOnTable={handleDropOnTable}
                  onDragOverTable={setDropTargetId}
                  onDragLeaveTable={() => setDropTargetId(null)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

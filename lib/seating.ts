import type {
  RSVP,
  SeatingAssignmentMap,
  SeatingParty,
  SeatingPerson,
  SeatingPlan,
  SeatingTable,
  SeatingTableWithPeople,
} from '../types'

// Default number of seats when a new table is created
export const SEATING_DEFAULT_CAPACITY = 8
export const SEATING_MAX_CAPACITY = 50
export const SEATING_MAX_TABLE_NAME_LENGTH = 100

/**
 * Stable identifier for one attendee: `<rsvpId>-<seatIndex>`.
 * seatIndex 0 is the person who submitted the RSVP, 1..n are their plus-ones.
 */
export function buildPersonId(rsvpId: number, seatIndex: number): string {
  return `${rsvpId}-${seatIndex}`
}

/** Parse a personId back into its parts, or null when malformed. */
export function parsePersonId(personId: string): { rsvpId: number; seatIndex: number } | null {
  const match = /^(\d+)-(\d+)$/.exec(personId)
  if (!match) return null
  return { rsvpId: Number(match[1]), seatIndex: Number(match[2]) }
}

/**
 * Expand attending RSVPs into individual people, keeping each party together.
 * Every attending RSVP yields `numberOfGuests + 1` people so plus-ones always
 * get a seat, even when the guest was never named on the form.
 */
export function buildParties(rsvps: RSVP[]): SeatingParty[] {
  return rsvps
    .filter((rsvp) => rsvp.isAttending)
    .map((rsvp) => {
      const size = Math.max(0, rsvp.numberOfGuests) + 1
      const people: SeatingPerson[] = [
        {
          personId: buildPersonId(rsvp.id, 0),
          rsvpId: rsvp.id,
          seatIndex: 0,
          name: rsvp.name,
          isPrimary: true,
          isNamed: true,
          partyName: rsvp.name,
          dietaryRestrictions: rsvp.dietaryRestrictions,
        },
      ]

      for (let i = 0; i < rsvp.numberOfGuests; i++) {
        const providedName = rsvp.guestNames?.[i]?.trim()
        const isNamed = Boolean(providedName)
        people.push({
          personId: buildPersonId(rsvp.id, i + 1),
          rsvpId: rsvp.id,
          seatIndex: i + 1,
          name: isNamed ? providedName! : `Guest ${i + 1} of ${rsvp.name}`,
          isPrimary: false,
          isNamed,
          partyName: rsvp.name,
          dietaryRestrictions: rsvp.dietaryRestrictions,
        })
      }

      return {
        rsvpId: rsvp.id,
        name: rsvp.name,
        email: rsvp.email,
        size,
        people,
        dietaryRestrictions: rsvp.dietaryRestrictions,
        notes: rsvp.notes,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** Flatten parties back into a personId -> person lookup. */
export function buildPeopleIndex(parties: SeatingParty[]): Map<string, SeatingPerson> {
  const index = new Map<string, SeatingPerson>()
  for (const party of parties) {
    for (const person of party.people) {
      index.set(person.personId, person)
    }
  }
  return index
}

function sortTables(tables: SeatingTable[]): SeatingTable[] {
  return [...tables].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
}

/**
 * Combine parties, tables and assignments into the view the planner renders.
 * Assignments pointing at people or tables that no longer exist are ignored.
 */
export function buildSeatingPlan(
  parties: SeatingParty[],
  tables: SeatingTable[],
  assignments: SeatingAssignmentMap
): SeatingPlan {
  const tableIds = new Set(tables.map((table) => table.id))
  const peopleByTable = new Map<number, SeatingPerson[]>()
  const unseatedByParty = new Map<number, SeatingPerson[]>()

  let seatedCount = 0
  let totalAttendees = 0

  for (const party of parties) {
    for (const person of party.people) {
      totalAttendees++
      const tableId = assignments[person.personId]

      if (tableId !== undefined && tableIds.has(tableId)) {
        const existing = peopleByTable.get(tableId)
        if (existing) {
          existing.push(person)
        } else {
          peopleByTable.set(tableId, [person])
        }
        seatedCount++
      } else {
        const existing = unseatedByParty.get(party.rsvpId)
        if (existing) {
          existing.push(person)
        } else {
          unseatedByParty.set(party.rsvpId, [person])
        }
      }
    }
  }

  const tablesWithPeople: SeatingTableWithPeople[] = sortTables(tables).map((table) => {
    const people = (peopleByTable.get(table.id) ?? []).sort(
      (a, b) => a.partyName.localeCompare(b.partyName) || a.seatIndex - b.seatIndex
    )
    const seatsUsed = people.length

    return {
      ...table,
      people,
      seatsUsed,
      seatsLeft: table.capacity - seatsUsed,
      isOverCapacity: seatsUsed > table.capacity,
      partyCount: new Set(people.map((person) => person.rsvpId)).size,
    }
  })

  const unseatedParties = parties
    .filter((party) => unseatedByParty.has(party.rsvpId))
    .map((party) => ({ ...party, people: unseatedByParty.get(party.rsvpId)! }))

  return {
    tables: tablesWithPeople,
    unseatedParties,
    totalAttendees,
    seatedCount,
    unseatedCount: totalAttendees - seatedCount,
    totalCapacity: tables.reduce((sum, table) => sum + table.capacity, 0),
  }
}

export interface AutoSeatResult {
  /** New assignments to persist (personId -> tableId), excluding people already seated */
  assignments: SeatingAssignmentMap
  /** Parties that could not be seated together anywhere */
  unplacedParties: SeatingParty[]
}

/**
 * Fill empty seats keeping every party at a single table.
 *
 * Largest parties are placed first, and each one goes to the tightest table it
 * still fits in so big groups keep their options open. When part of a party is
 * already seated, the rest joins that table if there is room. Parties that fit
 * nowhere are left alone rather than being split up.
 */
export function autoSeatParties(
  parties: SeatingParty[],
  tables: SeatingTable[],
  assignments: SeatingAssignmentMap
): AutoSeatResult {
  const plan = buildSeatingPlan(parties, tables, assignments)
  const seatsLeft = new Map<number, number>(
    plan.tables.map((table) => [table.id, Math.max(0, table.seatsLeft)])
  )
  const orderedTableIds = plan.tables.map((table) => table.id)

  const newAssignments: SeatingAssignmentMap = {}
  const unplacedParties: SeatingParty[] = []

  const pending = [...plan.unseatedParties].sort(
    (a, b) => b.people.length - a.people.length || a.name.localeCompare(b.name)
  )

  for (const party of pending) {
    const needed = party.people.length

    // Prefer the table where the rest of this party is already sitting
    const existingTable = plan.tables.find((table) =>
      table.people.some((person) => person.rsvpId === party.rsvpId)
    )

    let targetId: number | undefined
    if (existingTable && (seatsLeft.get(existingTable.id) ?? 0) >= needed) {
      targetId = existingTable.id
    } else {
      // Best fit: the table that leaves the fewest seats spare
      for (const tableId of orderedTableIds) {
        const available = seatsLeft.get(tableId) ?? 0
        if (available < needed) continue
        if (targetId === undefined || available < (seatsLeft.get(targetId) ?? 0)) {
          targetId = tableId
        }
      }
    }

    if (targetId === undefined) {
      unplacedParties.push(party)
      continue
    }

    for (const person of party.people) {
      newAssignments[person.personId] = targetId
    }
    seatsLeft.set(targetId, (seatsLeft.get(targetId) ?? 0) - needed)
  }

  return { assignments: newAssignments, unplacedParties }
}

// Distinct colors so a party stays visually recognizable across tables
const PARTY_COLORS = [
  'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-900/40 dark:text-rose-100 dark:border-rose-700',
  'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-900/40 dark:text-sky-100 dark:border-sky-700',
  'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-700',
  'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-100 dark:border-emerald-700',
  'bg-violet-100 text-violet-900 border-violet-300 dark:bg-violet-900/40 dark:text-violet-100 dark:border-violet-700',
  'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-900/40 dark:text-orange-100 dark:border-orange-700',
  'bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-900/40 dark:text-teal-100 dark:border-teal-700',
  'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300 dark:bg-fuchsia-900/40 dark:text-fuchsia-100 dark:border-fuchsia-700',
  'bg-lime-100 text-lime-900 border-lime-300 dark:bg-lime-900/40 dark:text-lime-100 dark:border-lime-700',
  'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-900/40 dark:text-cyan-100 dark:border-cyan-700',
] as const

/** Stable color classes for a party, so the same group looks alike everywhere. */
export function partyColorClasses(rsvpId: number): string {
  return PARTY_COLORS[Math.abs(rsvpId) % PARTY_COLORS.length]
}

/** Default name for the next table, e.g. "Table 4". */
export function nextTableName(tables: SeatingTable[]): string {
  const used = new Set(tables.map((table) => table.name.trim().toLowerCase()))
  let n = tables.length + 1
  while (used.has(`table ${n}`)) {
    n++
  }
  return `Table ${n}`
}

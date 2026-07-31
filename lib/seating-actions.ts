"use server"

import { revalidatePath } from "next/cache"
import { rsvpDb, seatingDb } from "./db"
import {
  seatingTableSchema,
  transformZodErrors,
  createServerValidationError,
  createServerValidationResult,
  type ValidationResult,
} from "./validations"
import { autoSeatParties, buildParties, buildPeopleIndex, nextTableName } from "./seating"
import type { SeatingAssignmentMap, SeatingPerson, SeatingTable } from "../types"

function revalidateSeating() {
  revalidatePath("/admin/seating")
  revalidatePath("/admin")
}

function failure<T>(message: string, field = "_form"): ValidationResult<T> {
  return createServerValidationResult<T>(undefined, [createServerValidationError(field, message)])
}

/**
 * Resolve the submitted person ids against the people who actually exist right
 * now, so a stale browser tab can never write assignments for guests who were
 * removed or whose RSVP changed to not attending.
 */
async function resolvePeople(personIds: string[]): Promise<SeatingPerson[]> {
  const rsvps = await rsvpDb.getAll()
  const peopleIndex = buildPeopleIndex(buildParties(rsvps))

  const resolved: SeatingPerson[] = []
  for (const personId of personIds) {
    const person = peopleIndex.get(personId)
    if (person) {
      resolved.push(person)
    }
  }
  return resolved
}

// Create a new table, defaulting the name to the next unused "Table N"
export async function createSeatingTableAction(
  input: { name?: string; capacity: number }
): Promise<ValidationResult<SeatingTable | undefined>> {
  try {
    const existingTables = await seatingDb.getTables()
    const name = input.name?.trim() || nextTableName(existingTables)

    const parsed = seatingTableSchema.safeParse({ name, capacity: input.capacity })
    if (!parsed.success) {
      return createServerValidationResult(undefined, transformZodErrors(parsed.error))
    }

    const table = await seatingDb.createTable(parsed.data.name, parsed.data.capacity)
    revalidateSeating()
    return createServerValidationResult(table)
  } catch (error) {
    console.error("Error creating seating table:", error)
    return failure("Failed to create table")
  }
}

// Rename a table or change how many seats it has
export async function updateSeatingTableAction(
  id: number,
  updates: { name?: string; capacity?: number }
): Promise<ValidationResult<SeatingTable | undefined>> {
  try {
    if (!Number.isFinite(id) || id <= 0) {
      return failure("Invalid table id")
    }

    if (updates.name === undefined && updates.capacity === undefined) {
      return failure("Nothing to update")
    }

    // Validate only the fields being changed, using valid stand-ins for the rest
    const parsed = seatingTableSchema.safeParse({
      name: updates.name ?? "placeholder",
      capacity: updates.capacity ?? 1,
    })
    if (!parsed.success) {
      return createServerValidationResult(undefined, transformZodErrors(parsed.error))
    }

    const table = await seatingDb.updateTable(id, {
      name: updates.name === undefined ? undefined : parsed.data.name,
      capacity: updates.capacity === undefined ? undefined : parsed.data.capacity,
    })

    if (!table) {
      return failure("Table not found")
    }

    revalidateSeating()
    return createServerValidationResult(table)
  } catch (error) {
    console.error("Error updating seating table:", error)
    return failure("Failed to update table")
  }
}

// Delete a table; everyone seated there returns to the unseated list
export async function deleteSeatingTableAction(
  id: number
): Promise<ValidationResult<{ id: number } | undefined>> {
  try {
    if (!Number.isFinite(id) || id <= 0) {
      return failure("Invalid table id")
    }

    const deleted = await seatingDb.deleteTable(id)
    if (!deleted) {
      return failure("Table not found")
    }

    revalidateSeating()
    return createServerValidationResult({ id })
  } catch (error) {
    console.error("Error deleting seating table:", error)
    return failure("Failed to delete table")
  }
}

// Seat one or more people at a table, moving anyone already seated elsewhere
export async function seatPeopleAction(
  personIds: string[],
  tableId: number
): Promise<ValidationResult<SeatingAssignmentMap | undefined>> {
  try {
    if (!Array.isArray(personIds) || personIds.length === 0) {
      return failure("No guests selected")
    }

    const tables = await seatingDb.getTables()
    if (!tables.some((table) => table.id === tableId)) {
      return failure("Table not found")
    }

    const people = await resolvePeople(personIds)
    if (people.length === 0) {
      return failure("Those guests are no longer on the attending list")
    }

    await seatingDb.assignPeople(
      people.map((person) => ({
        personId: person.personId,
        rsvpId: person.rsvpId,
        seatIndex: person.seatIndex,
      })),
      tableId
    )

    revalidateSeating()
    return createServerValidationResult(await seatingDb.getAssignments())
  } catch (error) {
    console.error("Error seating guests:", error)
    return failure("Failed to seat guests")
  }
}

// Return one or more people to the unseated list
export async function unseatPeopleAction(
  personIds: string[]
): Promise<ValidationResult<SeatingAssignmentMap | undefined>> {
  try {
    if (!Array.isArray(personIds) || personIds.length === 0) {
      return failure("No guests selected")
    }

    await seatingDb.unassignPeople(personIds)
    revalidateSeating()
    return createServerValidationResult(await seatingDb.getAssignments())
  } catch (error) {
    console.error("Error unseating guests:", error)
    return failure("Failed to unseat guests")
  }
}

// Fill the remaining seats, keeping every party at one table
export async function autoSeatAction(): Promise<
  ValidationResult<{ assignments: SeatingAssignmentMap; unplacedPartyNames: string[] } | undefined>
> {
  try {
    const [rsvps, tables, assignments] = await Promise.all([
      rsvpDb.getAll(),
      seatingDb.getTables(),
      seatingDb.getAssignments(),
    ])

    if (tables.length === 0) {
      return failure("Add at least one table first")
    }

    const parties = buildParties(rsvps)
    const result = autoSeatParties(parties, tables, assignments)
    const peopleIndex = buildPeopleIndex(parties)

    // Group the new assignments by table so each table is a single upsert
    const byTable = new Map<number, Array<{ personId: string; rsvpId: number; seatIndex: number }>>()
    for (const [personId, tableId] of Object.entries(result.assignments)) {
      const person = peopleIndex.get(personId)
      if (!person) continue

      const entry = { personId, rsvpId: person.rsvpId, seatIndex: person.seatIndex }
      const existing = byTable.get(tableId)
      if (existing) {
        existing.push(entry)
      } else {
        byTable.set(tableId, [entry])
      }
    }

    for (const [tableId, people] of byTable) {
      await seatingDb.assignPeople(people, tableId)
    }

    revalidateSeating()
    return createServerValidationResult({
      assignments: await seatingDb.getAssignments(),
      unplacedPartyNames: result.unplacedParties.map((party) => party.name),
    })
  } catch (error) {
    console.error("Error auto-seating guests:", error)
    return failure("Failed to auto-seat guests")
  }
}

// Empty every table without deleting the tables themselves
export async function clearSeatingAction(): Promise<ValidationResult<SeatingAssignmentMap | undefined>> {
  try {
    await seatingDb.clearAllAssignments()
    revalidateSeating()
    return createServerValidationResult({})
  } catch (error) {
    console.error("Error clearing seating chart:", error)
    return failure("Failed to clear the seating chart")
  }
}

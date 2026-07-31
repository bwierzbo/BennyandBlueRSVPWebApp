import {
  autoSeatParties,
  buildParties,
  buildPeopleIndex,
  buildPersonId,
  buildSeatingPlan,
  nextTableName,
  parsePersonId,
  partyColorClasses,
} from '../seating'
import type { RSVP, SeatingAssignmentMap, SeatingTable } from '../../types'

function makeRsvp(overrides: Partial<RSVP> & { id: number; name: string }): RSVP {
  return {
    email: `${overrides.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    isAttending: true,
    numberOfGuests: 0,
    guestNames: null,
    dietaryRestrictions: null,
    songRequests: null,
    notes: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  }
}

function makeTable(id: number, capacity: number, name = `Table ${id}`): SeatingTable {
  return { id, name, capacity, sortOrder: id }
}

describe('buildPersonId / parsePersonId', () => {
  it('round-trips an rsvp id and seat index', () => {
    expect(buildPersonId(12, 3)).toBe('12-3')
    expect(parsePersonId('12-3')).toEqual({ rsvpId: 12, seatIndex: 3 })
  })

  it('returns null for malformed ids', () => {
    expect(parsePersonId('abc')).toBeNull()
    expect(parsePersonId('12')).toBeNull()
    expect(parsePersonId('12-')).toBeNull()
    expect(parsePersonId('-3')).toBeNull()
  })
})

describe('buildParties', () => {
  it('excludes RSVPs that are not attending', () => {
    const parties = buildParties([
      makeRsvp({ id: 1, name: 'Ada Lovelace', isAttending: false, numberOfGuests: 2 }),
    ])
    expect(parties).toEqual([])
  })

  it('creates one person for a solo attendee', () => {
    const parties = buildParties([makeRsvp({ id: 1, name: 'Ada Lovelace' })])

    expect(parties).toHaveLength(1)
    expect(parties[0].size).toBe(1)
    expect(parties[0].people).toHaveLength(1)
    expect(parties[0].people[0]).toMatchObject({
      personId: '1-0',
      name: 'Ada Lovelace',
      isPrimary: true,
      isNamed: true,
      seatIndex: 0,
    })
  })

  it('includes every named plus-one alongside the primary guest', () => {
    const parties = buildParties([
      makeRsvp({
        id: 7,
        name: 'Grace Hopper',
        numberOfGuests: 2,
        guestNames: ['Alan Turing', 'Katherine Johnson'],
      }),
    ])

    expect(parties[0].size).toBe(3)
    expect(parties[0].people.map((p) => p.name)).toEqual([
      'Grace Hopper',
      'Alan Turing',
      'Katherine Johnson',
    ])
    expect(parties[0].people.map((p) => p.personId)).toEqual(['7-0', '7-1', '7-2'])
    expect(parties[0].people.slice(1).every((p) => !p.isPrimary)).toBe(true)
  })

  it('creates placeholder seats for plus-ones that were never named', () => {
    const parties = buildParties([
      makeRsvp({ id: 3, name: 'Ada Lovelace', numberOfGuests: 2, guestNames: null }),
    ])

    expect(parties[0].people).toHaveLength(3)
    expect(parties[0].people[1]).toMatchObject({
      name: 'Guest 1 of Ada Lovelace',
      isNamed: false,
      seatIndex: 1,
    })
    expect(parties[0].people[2].name).toBe('Guest 2 of Ada Lovelace')
  })

  it('falls back to a placeholder when only some plus-ones are named', () => {
    const parties = buildParties([
      makeRsvp({ id: 4, name: 'Ada Lovelace', numberOfGuests: 2, guestNames: ['Alan Turing'] }),
    ])

    expect(parties[0].people.map((p) => p.name)).toEqual([
      'Ada Lovelace',
      'Alan Turing',
      'Guest 2 of Ada Lovelace',
    ])
  })

  it('treats a blank guest name as unnamed', () => {
    const parties = buildParties([
      makeRsvp({ id: 5, name: 'Ada Lovelace', numberOfGuests: 1, guestNames: ['   '] }),
    ])

    expect(parties[0].people[1].isNamed).toBe(false)
    expect(parties[0].people[1].name).toBe('Guest 1 of Ada Lovelace')
  })

  it('sorts parties by name', () => {
    const parties = buildParties([
      makeRsvp({ id: 1, name: 'Zoe Adams' }),
      makeRsvp({ id: 2, name: 'Ada Lovelace' }),
    ])
    expect(parties.map((p) => p.name)).toEqual(['Ada Lovelace', 'Zoe Adams'])
  })

  it('carries dietary restrictions onto every member of the party', () => {
    const parties = buildParties([
      makeRsvp({
        id: 9,
        name: 'Ada Lovelace',
        numberOfGuests: 1,
        guestNames: ['Alan Turing'],
        dietaryRestrictions: 'No shellfish',
      }),
    ])
    expect(parties[0].people.every((p) => p.dietaryRestrictions === 'No shellfish')).toBe(true)
  })
})

describe('buildPeopleIndex', () => {
  it('indexes every person across all parties by personId', () => {
    const parties = buildParties([
      makeRsvp({ id: 1, name: 'Ada Lovelace', numberOfGuests: 1, guestNames: ['Alan Turing'] }),
      makeRsvp({ id: 2, name: 'Grace Hopper' }),
    ])
    const index = buildPeopleIndex(parties)

    expect(index.size).toBe(3)
    expect(index.get('1-1')?.name).toBe('Alan Turing')
    expect(index.get('2-0')?.name).toBe('Grace Hopper')
    expect(index.get('9-9')).toBeUndefined()
  })
})

describe('buildSeatingPlan', () => {
  const rsvps = [
    makeRsvp({ id: 1, name: 'Ada Lovelace', numberOfGuests: 1, guestNames: ['Alan Turing'] }),
    makeRsvp({ id: 2, name: 'Grace Hopper' }),
  ]

  it('reports everyone as unseated when there are no assignments', () => {
    const plan = buildSeatingPlan(buildParties(rsvps), [makeTable(1, 8)], {})

    expect(plan.totalAttendees).toBe(3)
    expect(plan.seatedCount).toBe(0)
    expect(plan.unseatedCount).toBe(3)
    expect(plan.unseatedParties).toHaveLength(2)
    expect(plan.tables[0].seatsUsed).toBe(0)
    expect(plan.tables[0].seatsLeft).toBe(8)
    expect(plan.totalCapacity).toBe(8)
  })

  it('places assigned people on their table and counts seats', () => {
    const assignments: SeatingAssignmentMap = { '1-0': 1, '1-1': 1 }
    const plan = buildSeatingPlan(buildParties(rsvps), [makeTable(1, 8)], assignments)

    expect(plan.seatedCount).toBe(2)
    expect(plan.tables[0].people.map((p) => p.name)).toEqual(['Ada Lovelace', 'Alan Turing'])
    expect(plan.tables[0].seatsLeft).toBe(6)
    expect(plan.tables[0].partyCount).toBe(1)
    expect(plan.unseatedParties.map((p) => p.name)).toEqual(['Grace Hopper'])
  })

  it('keeps a partly seated party in the unseated list with only its unseated members', () => {
    const plan = buildSeatingPlan(buildParties(rsvps), [makeTable(1, 8)], { '1-0': 1 })

    const ada = plan.unseatedParties.find((party) => party.rsvpId === 1)
    expect(ada).toBeDefined()
    expect(ada!.size).toBe(2)
    expect(ada!.people.map((p) => p.name)).toEqual(['Alan Turing'])
  })

  it('ignores assignments pointing at tables that no longer exist', () => {
    const plan = buildSeatingPlan(buildParties(rsvps), [makeTable(1, 8)], { '1-0': 99 })

    expect(plan.seatedCount).toBe(0)
    expect(plan.unseatedCount).toBe(3)
  })

  it('ignores assignments for people who no longer exist', () => {
    const plan = buildSeatingPlan(buildParties(rsvps), [makeTable(1, 8)], { '404-0': 1 })

    expect(plan.seatedCount).toBe(0)
    expect(plan.tables[0].seatsUsed).toBe(0)
  })

  it('flags a table seated beyond its capacity', () => {
    const plan = buildSeatingPlan(buildParties(rsvps), [makeTable(1, 2)], {
      '1-0': 1,
      '1-1': 1,
      '2-0': 1,
    })

    expect(plan.tables[0].seatsUsed).toBe(3)
    expect(plan.tables[0].isOverCapacity).toBe(true)
    expect(plan.tables[0].seatsLeft).toBe(-1)
    expect(plan.tables[0].partyCount).toBe(2)
  })

  it('orders tables by sortOrder then id', () => {
    const tables = [
      { id: 5, name: 'Late', capacity: 8, sortOrder: 2 },
      { id: 2, name: 'Early', capacity: 8, sortOrder: 1 },
    ]
    const plan = buildSeatingPlan(buildParties(rsvps), tables, {})
    expect(plan.tables.map((t) => t.name)).toEqual(['Early', 'Late'])
  })
})

describe('autoSeatParties', () => {
  it('keeps a party together at one table', () => {
    const parties = buildParties([
      makeRsvp({ id: 1, name: 'Ada Lovelace', numberOfGuests: 2, guestNames: ['A', 'B'] }),
    ])
    const result = autoSeatParties(parties, [makeTable(1, 8), makeTable(2, 8)], {})

    const tablesUsed = new Set(Object.values(result.assignments))
    expect(Object.keys(result.assignments)).toHaveLength(3)
    expect(tablesUsed.size).toBe(1)
    expect(result.unplacedParties).toEqual([])
  })

  it('never exceeds a table capacity', () => {
    const parties = buildParties([
      makeRsvp({ id: 1, name: 'A Party', numberOfGuests: 3 }), // 4 people
      makeRsvp({ id: 2, name: 'B Party', numberOfGuests: 3 }), // 4 people
    ])
    const tables = [makeTable(1, 4), makeTable(2, 4)]
    const result = autoSeatParties(parties, tables, {})

    const perTable = new Map<number, number>()
    for (const tableId of Object.values(result.assignments)) {
      perTable.set(tableId, (perTable.get(tableId) ?? 0) + 1)
    }

    expect(Object.keys(result.assignments)).toHaveLength(8)
    expect(perTable.get(1)).toBe(4)
    expect(perTable.get(2)).toBe(4)
  })

  it('leaves a party unplaced rather than splitting it across tables', () => {
    const parties = buildParties([
      makeRsvp({ id: 1, name: 'Big Party', numberOfGuests: 5 }), // 6 people
    ])
    const result = autoSeatParties(parties, [makeTable(1, 4), makeTable(2, 4)], {})

    expect(result.assignments).toEqual({})
    expect(result.unplacedParties.map((p) => p.name)).toEqual(['Big Party'])
  })

  it('does not move people who are already seated', () => {
    const parties = buildParties([
      makeRsvp({ id: 1, name: 'Ada Lovelace' }),
      makeRsvp({ id: 2, name: 'Grace Hopper' }),
    ])
    const result = autoSeatParties(parties, [makeTable(1, 8), makeTable(2, 8)], { '1-0': 2 })

    expect(result.assignments['1-0']).toBeUndefined()
    expect(result.assignments['2-0']).toBeDefined()
  })

  it('reunites the rest of a party with the table where its members already sit', () => {
    const parties = buildParties([
      makeRsvp({ id: 1, name: 'Ada Lovelace', numberOfGuests: 2, guestNames: ['A', 'B'] }),
    ])
    // Seat the primary guest at table 2; the plus-ones should follow
    const result = autoSeatParties(parties, [makeTable(1, 8), makeTable(2, 8)], { '1-0': 2 })

    expect(result.assignments['1-1']).toBe(2)
    expect(result.assignments['1-2']).toBe(2)
  })

  it('seats larger parties first so they are not squeezed out', () => {
    const parties = buildParties([
      makeRsvp({ id: 1, name: 'Solo' }), // 1 person
      makeRsvp({ id: 2, name: 'Family', numberOfGuests: 3 }), // 4 people
    ])
    // Only one table fits the family; the solo guest must not take that seat first
    const result = autoSeatParties(parties, [makeTable(1, 4), makeTable(2, 1)], {})

    expect(result.unplacedParties).toEqual([])
    expect(result.assignments['2-0']).toBe(1)
    expect(result.assignments['1-0']).toBe(2)
  })

  it('reports every party as unplaced when there are no tables', () => {
    const parties = buildParties([makeRsvp({ id: 1, name: 'Ada Lovelace' })])
    const result = autoSeatParties(parties, [], {})

    expect(result.assignments).toEqual({})
    expect(result.unplacedParties).toHaveLength(1)
  })
})

describe('partyColorClasses', () => {
  it('returns the same classes for the same party every time', () => {
    expect(partyColorClasses(42)).toBe(partyColorClasses(42))
  })

  it('returns a non-empty class string for any id', () => {
    for (const id of [0, 1, 7, 250, 9999]) {
      expect(partyColorClasses(id).length).toBeGreaterThan(0)
    }
  })
})

describe('nextTableName', () => {
  it('names the first table "Table 1"', () => {
    expect(nextTableName([])).toBe('Table 1')
  })

  it('continues the sequence after existing tables', () => {
    expect(nextTableName([makeTable(1, 8), makeTable(2, 8)])).toBe('Table 3')
  })

  it('skips names that are already taken', () => {
    const tables = [makeTable(1, 8, 'Head Table'), makeTable(2, 8, 'Table 3')]
    expect(nextTableName(tables)).toBe('Table 4')
  })
})

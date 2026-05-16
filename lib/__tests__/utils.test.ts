import { calculateTotalGuests } from '../utils'

describe('calculateTotalGuests', () => {
  it('returns 0 for empty list', () => {
    expect(calculateTotalGuests([])).toBe(0)
  })

  it('counts attending RSVP with 0 additional guests as 1', () => {
    expect(
      calculateTotalGuests([{ isAttending: true, numberOfGuests: 0 }])
    ).toBe(1)
  })

  it('counts attending RSVP with N additional guests as N + 1', () => {
    expect(
      calculateTotalGuests([{ isAttending: true, numberOfGuests: 3 }])
    ).toBe(4)
  })

  it('ignores non-attending RSVPs regardless of numberOfGuests', () => {
    expect(
      calculateTotalGuests([
        { isAttending: false, numberOfGuests: 0 },
        { isAttending: false, numberOfGuests: 5 },
      ])
    ).toBe(0)
  })

  it('sums mixed attending and non-attending RSVPs correctly', () => {
    expect(
      calculateTotalGuests([
        { isAttending: true, numberOfGuests: 0 },  // 1
        { isAttending: true, numberOfGuests: 2 },  // 3
        { isAttending: false, numberOfGuests: 0 }, // 0
        { isAttending: true, numberOfGuests: 4 },  // 5
      ])
    ).toBe(9)
  })
})

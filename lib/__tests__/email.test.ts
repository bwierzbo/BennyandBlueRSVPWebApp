import { escapeHtml, renderGuestListHtml } from '../guest-list-html'

describe('escapeHtml', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
    )
  })

  it("escapes ampersands and single quotes", () => {
    expect(escapeHtml(`Ben & "Blue" 'wed'`)).toBe(
      'Ben &amp; &quot;Blue&quot; &#39;wed&#39;'
    )
  })
})

describe('renderGuestListHtml', () => {
  it('counts only attending RSVPs (numberOfGuests + 1 per party)', () => {
    const result = renderGuestListHtml([
      { name: 'Alice', isAttending: true, numberOfGuests: 0, guestNames: null },     // 1
      { name: 'Bob', isAttending: true, numberOfGuests: 2, guestNames: ['B1', 'B2'] }, // 3
      { name: 'Carol', isAttending: false, numberOfGuests: 5, guestNames: null },    // 0
    ])
    expect(result.totalGuests).toBe(4)
    expect(result.partyCount).toBe(2)
  })

  it('returns 0 totals when list is empty', () => {
    const result = renderGuestListHtml([])
    expect(result.totalGuests).toBe(0)
    expect(result.partyCount).toBe(0)
    expect(result.html).toContain('No attending RSVPs yet.')
  })

  it('sorts attending RSVPs alphabetically by name', () => {
    const result = renderGuestListHtml([
      { name: 'Charlie', isAttending: true, numberOfGuests: 0, guestNames: null },
      { name: 'Alice', isAttending: true, numberOfGuests: 0, guestNames: null },
      { name: 'Bob', isAttending: true, numberOfGuests: 0, guestNames: null },
    ])
    const aliceIdx = result.html.indexOf('Alice')
    const bobIdx = result.html.indexOf('Bob')
    const charlieIdx = result.html.indexOf('Charlie')
    expect(aliceIdx).toBeLessThan(bobIdx)
    expect(bobIdx).toBeLessThan(charlieIdx)
  })

  it('escapes hostile values in names and guest names', () => {
    const result = renderGuestListHtml([
      {
        name: '<img src=x onerror=alert(1)>',
        isAttending: true,
        numberOfGuests: 1,
        guestNames: ['"><script>x</script>'],
      },
    ])
    expect(result.html).not.toContain('<img src=x')
    expect(result.html).not.toContain('<script>x</script>')
    expect(result.html).toContain('&lt;img src=x onerror=alert(1)&gt;')
    expect(result.html).toContain('&quot;&gt;&lt;script&gt;x&lt;/script&gt;')
  })

  it('omits non-attending RSVPs from the rendered table', () => {
    const result = renderGuestListHtml([
      { name: 'Attending Anne', isAttending: true, numberOfGuests: 0, guestNames: null },
      { name: 'Declined Dan', isAttending: false, numberOfGuests: 0, guestNames: null },
    ])
    expect(result.html).toContain('Attending Anne')
    expect(result.html).not.toContain('Declined Dan')
  })
})

export interface GuestListRsvp {
  name: string
  isAttending: boolean
  numberOfGuests: number
  guestNames: string[] | null
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function renderGuestListHtml(rsvps: GuestListRsvp[]): {
  html: string
  totalGuests: number
  partyCount: number
} {
  const attending = rsvps.filter(r => r.isAttending)
  const totalGuests = attending.reduce((sum, r) => sum + r.numberOfGuests + 1, 0)

  const sorted = [...attending].sort((a, b) => a.name.localeCompare(b.name))

  const rows = sorted
    .map(r => {
      const partySize = r.numberOfGuests + 1
      const names = [r.name, ...(r.guestNames ?? [])]
        .map(escapeHtml)
        .join(', ')
      return `<tr>
  <td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(r.name)}</td>
  <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${partySize}</td>
  <td style="padding:8px 12px;border-bottom:1px solid #eee;">${names}</td>
</tr>`
    })
    .join('\n')

  const html = `<!DOCTYPE html>
<html><body style="font-family:Arial,Helvetica,sans-serif;color:#222;">
  <h2 style="margin:0 0 8px 0;">Wedding Guest List</h2>
  <p style="margin:0 0 16px 0;color:#555;">
    ${attending.length} attending part${attending.length === 1 ? 'y' : 'ies'} &middot; ${totalGuests} total guest${totalGuests === 1 ? '' : 's'}
  </p>
  ${attending.length === 0
    ? '<p>No attending RSVPs yet.</p>'
    : `<table style="border-collapse:collapse;width:100%;max-width:640px;">
    <thead>
      <tr style="background:#f5f5f5;text-align:left;">
        <th style="padding:8px 12px;border-bottom:2px solid #ddd;">RSVP</th>
        <th style="padding:8px 12px;border-bottom:2px solid #ddd;text-align:center;">Party Size</th>
        <th style="padding:8px 12px;border-bottom:2px solid #ddd;">Guests</th>
      </tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>`}
</body></html>`

  return { html, totalGuests, partyCount: attending.length }
}

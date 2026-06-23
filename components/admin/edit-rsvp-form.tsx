"use client"

import { useState, useTransition } from 'react'
import type { RSVP } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateRSVPAction } from '@/lib/actions'

interface EditRSVPFormProps {
  rsvp: RSVP
  onCancel: () => void
  onSaved: () => void
}

const NAME_RE = /^[a-zA-Z\s'-]+$/
const GUEST_NAME_RE = /^[a-zA-Z0-9\s'-]+$/

function validate(form: {
  name: string
  email: string
  isAttending: boolean
  numberOfGuests: number
  guestNames: string[]
  dietaryRestrictions: string
  songRequests: string
  notes: string
}): { ok: true } | { ok: false; error: string } {
  if (!form.name.trim()) return { ok: false, error: 'Name is required' }
  if (form.name.length > 100) return { ok: false, error: 'Name must be 100 characters or less' }
  if (!NAME_RE.test(form.name)) return { ok: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' }
  if (!form.email.trim()) return { ok: false, error: 'Email is required' }
  if (form.email.length > 254) return { ok: false, error: 'Email must be 254 characters or less' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return { ok: false, error: 'Please enter a valid email address' }
  if (!Number.isInteger(form.numberOfGuests) || form.numberOfGuests < 0 || form.numberOfGuests > 10) {
    return { ok: false, error: 'Number of guests must be a whole number between 0 and 10' }
  }
  if (!form.isAttending && form.numberOfGuests > 0) {
    return { ok: false, error: 'Guest count must be 0 when not attending' }
  }
  if (form.isAttending && form.numberOfGuests !== form.guestNames.length) {
    return { ok: false, error: `Provide ${form.numberOfGuests} guest name${form.numberOfGuests === 1 ? '' : 's'}` }
  }
  for (let i = 0; i < form.guestNames.length; i++) {
    const g = form.guestNames[i]
    if (!g.trim()) return { ok: false, error: `Guest ${i + 1} name is required` }
    if (g.length > 100) return { ok: false, error: `Guest ${i + 1} name must be 100 characters or less` }
    if (!GUEST_NAME_RE.test(g)) return { ok: false, error: `Guest ${i + 1} name contains invalid characters` }
  }
  if (form.dietaryRestrictions.length > 500) return { ok: false, error: 'Dietary restrictions must be 500 characters or less' }
  if (form.songRequests.length > 500) return { ok: false, error: 'Song requests must be 500 characters or less' }
  if (form.notes.length > 1000) return { ok: false, error: 'Notes must be 1000 characters or less' }
  return { ok: true }
}

export function EditRSVPForm({ rsvp, onCancel, onSaved }: EditRSVPFormProps) {
  const [name, setName] = useState(rsvp.name)
  const [email, setEmail] = useState(rsvp.email)
  const [isAttending, setIsAttending] = useState(rsvp.isAttending)
  const [numberOfGuests, setNumberOfGuests] = useState(rsvp.numberOfGuests)
  const [guestNames, setGuestNames] = useState<string[]>(rsvp.guestNames ?? [])
  const [dietaryRestrictions, setDietaryRestrictions] = useState(rsvp.dietaryRestrictions ?? '')
  const [songRequests, setSongRequests] = useState(rsvp.songRequests ?? '')
  const [notes, setNotes] = useState(rsvp.notes ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const addGuest = () => {
    if (guestNames.length >= 10) return
    setGuestNames([...guestNames, ''])
    setNumberOfGuests(guestNames.length + 1)
  }

  const removeGuest = (index: number) => {
    const next = guestNames.filter((_, i) => i !== index)
    setGuestNames(next)
    setNumberOfGuests(next.length)
  }

  const updateGuestName = (index: number, value: string) => {
    setGuestNames(guestNames.map((g, i) => (i === index ? value : g)))
  }

  const handleAttendanceChange = (attending: boolean) => {
    setIsAttending(attending)
    if (!attending) {
      setNumberOfGuests(0)
      setGuestNames([])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const form = {
      name: name.trim(),
      email: email.trim(),
      isAttending,
      numberOfGuests,
      guestNames: guestNames.map(g => g.trim()),
      dietaryRestrictions: dietaryRestrictions.trim(),
      songRequests: songRequests.trim(),
      notes: notes.trim(),
    }

    const v = validate(form)
    if (!v.ok) {
      setError(v.error)
      return
    }

    startTransition(async () => {
      const result = await updateRSVPAction(rsvp.id, {
        name: form.name,
        email: form.email,
        isAttending: form.isAttending,
        numberOfGuests: form.numberOfGuests,
        guestNames: form.guestNames,
        dietaryRestrictions: form.dietaryRestrictions || null,
        songRequests: form.songRequests || null,
        notes: form.notes || null,
      })

      if (!result.success) {
        setError(result.errors?.[0]?.message ?? 'Failed to update RSVP')
        return
      }
      onSaved()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor={`edit-name-${rsvp.id}`}>Name *</Label>
          <Input
            id={`edit-name-${rsvp.id}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isPending}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`edit-email-${rsvp.id}`}>Email *</Label>
          <Input
            id={`edit-email-${rsvp.id}`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isPending}
          />
        </div>
      </div>

      <fieldset className="space-y-1">
        <legend className="text-sm font-medium">Attendance</legend>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={isAttending}
              onChange={() => handleAttendanceChange(true)}
              disabled={isPending}
            />
            <span>Attending</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={!isAttending}
              onChange={() => handleAttendanceChange(false)}
              disabled={isPending}
            />
            <span>Not attending</span>
          </label>
        </div>
      </fieldset>

      {isAttending && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Additional Guests ({guestNames.length}/10)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addGuest}
              disabled={isPending || guestNames.length >= 10}
            >
              + Add Guest
            </Button>
          </div>

          {guestNames.length === 0 ? (
            <p className="text-sm text-gray-500">No additional guests.</p>
          ) : (
            <ul className="space-y-2">
              {guestNames.map((g, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Input
                    value={g}
                    onChange={(e) => updateGuestName(i, e.target.value)}
                    placeholder={`Guest ${i + 1} name`}
                    disabled={isPending}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeGuest(i)}
                    disabled={isPending}
                    className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor={`edit-dietary-${rsvp.id}`}>Dietary Restrictions</Label>
        <Textarea
          id={`edit-dietary-${rsvp.id}`}
          value={dietaryRestrictions}
          onChange={(e) => setDietaryRestrictions(e.target.value)}
          disabled={isPending}
          rows={2}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`edit-songs-${rsvp.id}`}>Song Requests</Label>
        <Textarea
          id={`edit-songs-${rsvp.id}`}
          value={songRequests}
          onChange={(e) => setSongRequests(e.target.value)}
          disabled={isPending}
          rows={2}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`edit-notes-${rsvp.id}`}>Notes</Label>
        <Textarea
          id={`edit-notes-${rsvp.id}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isPending}
          rows={2}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}

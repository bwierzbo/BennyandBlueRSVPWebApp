import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * Sum total party size across RSVPs. Mirrors the DB stats query:
 * each attending RSVP contributes `numberOfGuests + 1` (primary + additional).
 */
export function calculateTotalGuests(
  rsvps: Array<{ isAttending: boolean; numberOfGuests: number }>
): number {
  return rsvps.reduce(
    (sum, r) => (r.isAttending ? sum + r.numberOfGuests + 1 : sum),
    0
  )
}
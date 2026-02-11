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
 * Get the RSVP deadline: 2 months before the wedding date.
 * Uses WEDDING_DATE env var (YYYY-MM-DD format).
 * Returns end of day on the deadline date.
 */
export function getRSVPDeadline(): Date {
  const weddingDateStr = process.env.WEDDING_DATE || '2026-08-22'
  const wedding = new Date(weddingDateStr + 'T23:59:59')
  wedding.setMonth(wedding.getMonth() - 2)
  return wedding
}

/**
 * Check if the RSVP period is still open.
 */
export function isRSVPOpen(): boolean {
  return new Date() <= getRSVPDeadline()
}
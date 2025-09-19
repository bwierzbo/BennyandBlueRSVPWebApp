/**
 * Admin-specific utility functions for data processing and formatting
 */

import type { RSVP, RSVPStats } from '@/types'

export const adminUtils = {
  /**
   * Format date for admin displays with relative time
   */
  formatTimestamp: (timestamp: Date | string): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  },

  /**
   * Get relative time string (e.g., "2 hours ago")
   */
  getRelativeTime: (timestamp: Date | string): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSeconds < 60) {
      return 'Just now'
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    } else {
      return adminUtils.formatTimestamp(date)
    }
  },

  /**
   * Calculate attendance rate percentage
   */
  calculateAttendanceRate: (stats: RSVPStats): number => {
    if (stats.total_responses === 0) return 0
    return (stats.attending_count / stats.total_responses) * 100
  },

  /**
   * Calculate average guests per RSVP
   */
  calculateAverageGuests: (stats: RSVPStats): number => {
    if (stats.total_responses === 0) return 0
    return stats.total_guests / stats.total_responses
  },

  /**
   * Check if an RSVP is recent (within last 24 hours)
   */
  isRecentSubmission: (timestamp: Date | string): boolean => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    return diffMs < 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  },

  /**
   * Sort RSVPs by various criteria
   */
  sortRSVPs: (rsvps: RSVP[], sortBy: 'date' | 'name' | 'status' | 'guests', direction: 'asc' | 'desc' = 'desc'): RSVP[] => {
    const sorted = [...rsvps].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'status':
          // Attending first, then not attending
          comparison = (b.isAttending ? 1 : 0) - (a.isAttending ? 1 : 0)
          break
        case 'guests':
          comparison = a.numberOfGuests - b.numberOfGuests
          break
        default:
          return 0
      }

      return direction === 'desc' ? -comparison : comparison
    })

    return sorted
  },

  /**
   * Filter RSVPs by status
   */
  filterRSVPs: (rsvps: RSVP[], filter: 'all' | 'attending' | 'not-attending' | 'recent'): RSVP[] => {
    switch (filter) {
      case 'attending':
        return rsvps.filter(rsvp => rsvp.isAttending)
      case 'not-attending':
        return rsvps.filter(rsvp => !rsvp.isAttending)
      case 'recent':
        return rsvps.filter(rsvp => adminUtils.isRecentSubmission(rsvp.createdAt))
      case 'all':
      default:
        return rsvps
    }
  },

  /**
   * Get summary statistics for a subset of RSVPs
   */
  getSubsetStats: (rsvps: RSVP[]): RSVPStats => {
    const attending = rsvps.filter(rsvp => rsvp.isAttending)
    const totalGuests = attending.reduce((sum, rsvp) => sum + rsvp.numberOfGuests, 0)

    return {
      total_responses: rsvps.length,
      attending_count: attending.length,
      not_attending_count: rsvps.length - attending.length,
      total_guests: totalGuests
    }
  },

  /**
   * Format guest count with proper pluralization
   */
  formatGuestCount: (count: number): string => {
    if (count === 0) return 'No guests'
    if (count === 1) return '1 guest'
    return `${count} guests`
  },

  /**
   * Get party size category
   */
  getPartySizeCategory: (numberOfGuests: number): 'solo' | 'couple' | 'small-group' | 'large-group' => {
    if (numberOfGuests === 1) return 'solo'
    if (numberOfGuests === 2) return 'couple'
    if (numberOfGuests <= 4) return 'small-group'
    return 'large-group'
  },

  /**
   * Generate a summary sentence for admin overview
   */
  generateSummary: (stats: RSVPStats): string => {
    if (stats.total_responses === 0) {
      return 'No RSVP responses received yet.'
    }

    const attendanceRate = adminUtils.calculateAttendanceRate(stats)
    const avgGuests = adminUtils.calculateAverageGuests(stats)

    return `${stats.total_responses} responses received with ${attendanceRate.toFixed(1)}% attendance rate. Expecting ${stats.total_guests} total guests (${avgGuests.toFixed(1)} avg per party).`
  }
}

export default adminUtils
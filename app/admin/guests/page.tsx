import { Suspense } from 'react'
import { Metadata } from 'next'
import { rsvpDb } from '@/lib/db'
import type { RSVPStats } from '@/types'
import { SummaryStats } from '@/components/admin/summary-stats'
import { SearchableGuestList } from '@/components/admin/searchable-guest-list'
import { ExportRSVPButton } from '@/components/admin/export-rsvp-button'
import { AdminPageSkeleton } from '@/components/admin/loading-skeleton'

export const metadata: Metadata = {
  title: 'Guest List - Admin Dashboard',
  description: 'View and manage all wedding RSVP submissions',
}

// Loading component for suspense boundary
function LoadingGuestList() {
  return <AdminPageSkeleton />
}

// Main guest list component with data fetching
async function GuestList() {
  try {
    // Fetch all RSVPs and statistics in parallel for better performance
    const [rsvps, stats] = await Promise.all([
      rsvpDb.getAll(),
      rsvpDb.getStats()
    ])

    const typedStats = stats as RSVPStats
    return (
      <div>
        <SummaryStats stats={typedStats} className="mb-8" />

        <SearchableGuestList
          rsvps={rsvps}
          totalGuests={Number(typedStats.total_guests)}
          actions={<ExportRSVPButton rsvps={rsvps} />}
        />
      </div>
    )
  } catch (error) {
    console.error('Error fetching guest data:', error)
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
            Error Loading Guest Data
          </h3>
          <p className="text-red-600 dark:text-red-400">
            Unable to load guest information. Please check the database connection and try again.
          </p>
        </div>
      </div>
    )
  }
}

// Main page component
export default function AdminGuestsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Guest Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage all wedding RSVP submissions
        </p>
      </div>

      <Suspense fallback={<LoadingGuestList />}>
        <GuestList />
      </Suspense>
    </div>
  )
}

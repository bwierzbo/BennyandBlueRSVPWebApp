import { Suspense } from 'react'
import { Metadata } from 'next'
import { rsvpDb } from '@/lib/db'
import type { RSVP, RSVPStats } from '@/types'
import { SummaryStats } from '@/components/admin/summary-stats'
import { RSVPCard } from '@/components/admin/rsvp-card'
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

    return (
      <div>
        <SummaryStats stats={stats as RSVPStats} className="mb-8" />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            All RSVP Submissions ({rsvps.length})
          </h2>

          {rsvps.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No RSVP submissions yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-1">
              {rsvps.map((rsvp) => (
                <RSVPCard key={rsvp.id} rsvp={rsvp} />
              ))}
            </div>
          )}
        </div>
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
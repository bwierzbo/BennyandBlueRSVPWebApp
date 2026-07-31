import { Suspense } from 'react'
import { Metadata } from 'next'
import { rsvpDb, seatingDb } from '@/lib/db'
import { SeatingPlanner } from '@/components/admin/seating-planner'
import { AdminPageSkeleton } from '@/components/admin/loading-skeleton'

export const metadata: Metadata = {
  title: 'Seating Chart - Admin Dashboard',
  description: 'Plan table assignments for every attending guest and plus-one',
}

function LoadingSeating() {
  return <AdminPageSkeleton />
}

async function SeatingContent() {
  try {
    // Drop assignments for guests who have since cancelled or been removed
    await seatingDb.pruneStaleAssignments()

    const [rsvps, tables, assignments] = await Promise.all([
      rsvpDb.getAll(),
      seatingDb.getTables(),
      seatingDb.getAssignments(),
    ])

    return (
      <SeatingPlanner rsvps={rsvps} initialTables={tables} initialAssignments={assignments} />
    )
  } catch (error) {
    console.error('Error loading seating data:', error)

    // The seating tables are created by a migration, so call that out directly
    const needsMigration =
      error instanceof Error && error.message.includes('does not exist')

    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
          {needsMigration ? 'Seating tables not set up yet' : 'Error Loading Seating Chart'}
        </h3>
        {needsMigration ? (
          <p className="text-red-600 dark:text-red-400">
            Run{' '}
            <code className="rounded bg-red-100 px-1 py-0.5 dark:bg-red-900/40">
              npm run db:seating
            </code>{' '}
            to create the seating tables, then reload this page.
          </p>
        ) : (
          <p className="text-red-600 dark:text-red-400">
            Unable to load seating information. Please check the database connection and try again.
          </p>
        )}
      </div>
    )
  }
}

export default function AdminSeatingPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Seating Chart</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Every attending guest and plus-one, ready to be grouped onto tables. Drag a party onto a
          table, or select people and seat them together.
        </p>
      </div>

      <Suspense fallback={<LoadingSeating />}>
        <SeatingContent />
      </Suspense>
    </div>
  )
}

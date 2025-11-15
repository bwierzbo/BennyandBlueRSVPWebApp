import { Suspense } from 'react'
import { Metadata } from 'next'
import { rsvpDb } from '@/lib/db'
import { AdminPageSkeleton } from '@/components/admin/loading-skeleton'

export const metadata: Metadata = {
  title: 'Song Requests - Admin Dashboard',
  description: 'View all song requests from RSVP submissions',
}

// Loading component
function LoadingSongRequests() {
  return <AdminPageSkeleton />
}

// Main song requests component
async function SongRequestsList() {
  try {
    // Fetch all RSVPs
    const rsvps = await rsvpDb.getAll()

    // Filter for attending guests with song requests
    const guestsWithSongs = rsvps.filter(
      rsvp => rsvp.isAttending && rsvp.songRequests
    )

    return (
      <div>
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Total RSVPs
            </p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {rsvps.length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Attending Guests
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {rsvps.filter(r => r.isAttending).length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              With Song Requests
            </p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {guestsWithSongs.length}
            </p>
          </div>
        </div>

        {/* Song Requests List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            All Song Requests ({guestsWithSongs.length})
          </h2>

          {guestsWithSongs.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">
                No song requests submitted yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {guestsWithSongs.map((rsvp) => (
                <div
                  key={rsvp.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {rsvp.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {rsvp.email}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
                      {rsvp.numberOfGuests} guest{rsvp.numberOfGuests !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-1">
                          Song Requests:
                        </p>
                        <p className="text-purple-900 dark:text-purple-100 whitespace-pre-wrap">
                          {rsvp.songRequests}
                        </p>
                      </div>
                    </div>
                  </div>

                  {rsvp.guestNames && rsvp.guestNames.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Guest Names:
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {rsvp.guestNames.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching song requests:', error)
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
          Error Loading Data
        </h3>
        <p className="text-red-600 dark:text-red-400">
          Unable to load song requests. Please check the database connection.
        </p>
      </div>
    )
  }
}

// Main page component
export default function AdminSongsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Song Requests
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View all song requests from attending guests
        </p>
      </div>

      <Suspense fallback={<LoadingSongRequests />}>
        <SongRequestsList />
      </Suspense>
    </div>
  )
}

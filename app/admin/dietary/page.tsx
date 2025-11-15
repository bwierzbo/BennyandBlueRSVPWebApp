import { Suspense } from 'react'
import { Metadata } from 'next'
import { rsvpDb } from '@/lib/db'
import { AdminPageSkeleton } from '@/components/admin/loading-skeleton'

export const metadata: Metadata = {
  title: 'Dietary Restrictions - Admin Dashboard',
  description: 'View all dietary restrictions from RSVP submissions',
}

// Loading component
function LoadingDietaryRestrictions() {
  return <AdminPageSkeleton />
}

// Main dietary restrictions component
async function DietaryRestrictionsList() {
  try {
    // Fetch all RSVPs
    const rsvps = await rsvpDb.getAll()

    // Filter for attending guests with dietary restrictions
    const guestsWithRestrictions = rsvps.filter(
      rsvp => rsvp.isAttending && rsvp.dietaryRestrictions
    )

    // Group by dietary restriction for better organization
    const restrictionsMap = new Map<string, Array<{ name: string; email: string; restriction: string }>>()

    guestsWithRestrictions.forEach(rsvp => {
      if (rsvp.dietaryRestrictions) {
        const key = rsvp.dietaryRestrictions.toLowerCase()
        if (!restrictionsMap.has(key)) {
          restrictionsMap.set(key, [])
        }
        restrictionsMap.get(key)!.push({
          name: rsvp.name,
          email: rsvp.email,
          restriction: rsvp.dietaryRestrictions
        })
      }
    })

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
              With Dietary Restrictions
            </p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {guestsWithRestrictions.length}
            </p>
          </div>
        </div>

        {/* Dietary Restrictions List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            All Dietary Restrictions ({guestsWithRestrictions.length})
          </h2>

          {guestsWithRestrictions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">
                No dietary restrictions reported yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {guestsWithRestrictions.map((rsvp) => (
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
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 dark:bg-orange-900 dark:text-orange-200">
                      {rsvp.numberOfGuests} guest{rsvp.numberOfGuests !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-100 dark:border-orange-800">
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">
                      Dietary Restrictions:
                    </p>
                    <p className="text-orange-900 dark:text-orange-100">
                      {rsvp.dietaryRestrictions}
                    </p>
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
    console.error('Error fetching dietary restrictions:', error)
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
          Error Loading Data
        </h3>
        <p className="text-red-600 dark:text-red-400">
          Unable to load dietary restrictions. Please check the database connection.
        </p>
      </div>
    )
  }
}

// Main page component
export default function AdminDietaryPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dietary Restrictions
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View all dietary restrictions and allergies from attending guests
        </p>
      </div>

      <Suspense fallback={<LoadingDietaryRestrictions />}>
        <DietaryRestrictionsList />
      </Suspense>
    </div>
  )
}

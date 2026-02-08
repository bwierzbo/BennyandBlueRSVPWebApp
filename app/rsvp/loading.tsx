export default function RSVPLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-wedding-dustyPink-50 to-wedding-lavender-100">
      {/* Banner skeleton */}
      <div className="w-full h-[300px] bg-wedding-gray-200 animate-pulse rounded-b-lg" />

      <div className="container mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="text-center mb-8">
          <div className="h-10 w-64 bg-wedding-gray-200 animate-pulse rounded mx-auto mb-4" />
          <div className="h-6 w-40 bg-wedding-gray-200 animate-pulse rounded mx-auto mb-2" />
          <div className="h-5 w-56 bg-wedding-gray-200 animate-pulse rounded mx-auto" />
        </div>

        {/* Form card skeleton */}
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <div className="space-y-6">
            {/* Name field */}
            <div>
              <div className="h-4 w-20 bg-wedding-gray-200 animate-pulse rounded mb-2" />
              <div className="h-10 w-full bg-wedding-gray-100 animate-pulse rounded" />
            </div>
            {/* Email field */}
            <div>
              <div className="h-4 w-24 bg-wedding-gray-200 animate-pulse rounded mb-2" />
              <div className="h-10 w-full bg-wedding-gray-100 animate-pulse rounded" />
            </div>
            {/* Attendance field */}
            <div>
              <div className="h-4 w-32 bg-wedding-gray-200 animate-pulse rounded mb-2" />
              <div className="h-10 w-full bg-wedding-gray-100 animate-pulse rounded" />
            </div>
            {/* Notes field */}
            <div>
              <div className="h-4 w-16 bg-wedding-gray-200 animate-pulse rounded mb-2" />
              <div className="h-24 w-full bg-wedding-gray-100 animate-pulse rounded" />
            </div>
            {/* Submit button */}
            <div className="h-12 w-full bg-wedding-roseGold-200 animate-pulse rounded" />
          </div>
        </div>

        {/* Back button skeleton */}
        <div className="text-center mt-8">
          <div className="h-9 w-32 bg-wedding-gray-200 animate-pulse rounded mx-auto" />
        </div>
      </div>
    </main>
  )
}

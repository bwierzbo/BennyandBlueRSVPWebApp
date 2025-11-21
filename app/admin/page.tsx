import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { rsvpDb } from '@/lib/db'
import { AdminPageSkeleton } from '@/components/admin/loading-skeleton'
import { TestEmailButton } from '@/components/admin/test-email-button'

export const metadata: Metadata = {
  title: 'Admin Dashboard - Benny & Blue Wedding',
  description: 'Wedding RSVP administration dashboard',
}

// Loading component
function LoadingDashboard() {
  return <AdminPageSkeleton />
}

// Main dashboard component
async function DashboardContent() {
  try {
    // Fetch all RSVPs and calculate statistics
    const rsvps = await rsvpDb.getAll()
    const stats = await rsvpDb.getStats()

    const attendingGuests = rsvps.filter(r => r.isAttending)
    const guestsWithDietaryRestrictions = attendingGuests.filter(r => r.dietaryRestrictions)
    const guestsWithSongRequests = attendingGuests.filter(r => r.songRequests)

    // Calculate attendance rate
    const attendanceRate = Number(stats.total_responses) > 0
      ? (Number(stats.attending_count) / Number(stats.total_responses)) * 100
      : 0

    // Get recent submissions (last 24 hours)
    const recentSubmissions = rsvps.filter(
      rsvp => Date.now() - new Date(rsvp.createdAt).getTime() < 24 * 60 * 60 * 1000
    )

    return (
      <div className="space-y-8">
        {/* Summary Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total RSVPs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Total Responses
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.total_responses}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Attending */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Attending
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.attending_count}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {attendanceRate.toFixed(1)}% response rate
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Guests */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Total Guests (All Parties)
                </p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.total_guests}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Sum of all party sizes
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Recent (24h)
                </p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {recentSubmissions.length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  New responses
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Progress Bar */}
        {Number(stats.total_responses) > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Attendance Overview
              </h3>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {attendanceRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(attendanceRate, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{stats.attending_count} attending</span>
              <span>{stats.not_attending_count} not attending</span>
            </div>
          </div>
        )}

        {/* Test Email Button */}
        <TestEmailButton />

        {/* Quick Links Grid */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Access
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Guest List */}
            <Link href="/admin/guests">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-500">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Guest List
                  </h4>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  View all RSVP submissions with complete details
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {rsvps.length}
                  </span>
                  <span className="text-sm text-gray-500">RSVPs</span>
                </div>
              </div>
            </Link>

            {/* Dietary Restrictions */}
            <Link href="/admin/dietary">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-orange-500">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-3">
                    <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Dietary Restrictions
                  </h4>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  Special dietary needs and allergies
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {guestsWithDietaryRestrictions.length}
                  </span>
                  <span className="text-sm text-gray-500">Guests</span>
                </div>
              </div>
            </Link>

            {/* Song Requests */}
            <Link href="/admin/songs">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-purple-500">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Song Requests
                  </h4>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  Music requests from your guests
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {guestsWithSongRequests.length}
                  </span>
                  <span className="text-sm text-gray-500">Requests</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading dashboard data:', error)
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
          Error Loading Dashboard
        </h3>
        <p className="text-red-600 dark:text-red-400">
          Unable to load dashboard data. Please check the database connection.
        </p>
      </div>
    )
  }
}

// Main page component
export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Wedding Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of all RSVP responses and guest information
        </p>
      </div>

      <Suspense fallback={<LoadingDashboard />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}

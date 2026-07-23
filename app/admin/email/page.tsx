import { Suspense } from 'react'
import type { Metadata } from 'next'
import { rsvpDb } from '@/lib/db'
import { MassEmailForm } from '@/components/admin/mass-email-form'
import { AdminPageSkeleton } from '@/components/admin/loading-skeleton'

export const metadata: Metadata = {
  title: 'Send Email - Admin Dashboard',
  description: 'Send a message to all RSVP respondents',
}

async function EmailContent() {
  try {
    const rsvps = await rsvpDb.getAll()
    return <MassEmailForm rsvps={rsvps} />
  } catch (error) {
    console.error('Error loading recipients:', error)
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
          Error Loading Recipients
        </h3>
        <p className="text-red-600 dark:text-red-400">
          Unable to load the RSVP list. Please check the database connection.
        </p>
      </div>
    )
  }
}

export default function AdminEmailPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Send Email
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Send a message to every email address that has RSVPed.
        </p>
      </div>

      <Suspense fallback={<AdminPageSkeleton />}>
        <EmailContent />
      </Suspense>
    </div>
  )
}

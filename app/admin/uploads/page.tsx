import { Suspense } from 'react'
import { Metadata } from 'next'
import { uploadsDb } from '@/lib/db'
import { formatBytes, groupUploadsByGuest } from '@/lib/memories'
import { isBlobConfigured, presignDownloads } from '@/lib/blob'
import { AdminPageSkeleton } from '@/components/admin/loading-skeleton'

export const metadata: Metadata = {
  title: 'Guest Uploads - Admin Dashboard',
  description: 'Photos and videos guests have shared from the memories page',
}

// Download links are short-lived, so always render fresh
export const dynamic = 'force-dynamic'

function LoadingUploads() {
  return <AdminPageSkeleton />
}

async function UploadsList() {
  try {
    const uploads = await uploadsDb.getAll()
    const groups = groupUploadsByGuest(uploads)
    const totalBytes = uploads.reduce((sum, upload) => sum + upload.sizeBytes, 0)

    const canDownload = isBlobConfigured()
    const downloadUrls = canDownload
      ? await presignDownloads(uploads.map((upload) => upload.key))
      : new Map<string, string>()

    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Files</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{uploads.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Size</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatBytes(totalBytes)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Guests</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{groups.length}</p>
          </div>
        </div>

        {!canDownload && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-amber-800 dark:text-amber-200">
            BLOB_READ_WRITE_TOKEN is not set, so download links are unavailable. See MEMORIES_SETUP.md.
          </div>
        )}

        {groups.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No photos or videos uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div
                key={group.guestName}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex flex-wrap justify-between items-baseline gap-2 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{group.guestName}</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {group.uploads.length} file{group.uploads.length !== 1 ? 's' : ''} · {formatBytes(group.totalBytes)}
                  </span>
                </div>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {group.uploads.map((upload) => {
                    const downloadUrl = downloadUrls.get(upload.key)
                    return (
                      <li key={upload.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2">
                        <div className="min-w-0">
                          {downloadUrl ? (
                            <a
                              href={downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block truncate text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {upload.filename}
                            </a>
                          ) : (
                            <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">
                              {upload.filename}
                            </span>
                          )}
                          <p className="truncate text-xs text-gray-500 dark:text-gray-400">{upload.key}</p>
                        </div>
                        <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                          {upload.contentType} · {formatBytes(upload.sizeBytes)} ·{' '}
                          {new Date(upload.createdAt).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                            timeZone: 'America/Los_Angeles',
                          })}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error('Error loading guest uploads:', error)

    // The table is created by a migration, so call that out directly
    const needsMigration = error instanceof Error && error.message.includes('does not exist')

    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
          {needsMigration ? 'Guest uploads table not set up yet' : 'Error Loading Uploads'}
        </h3>
        {needsMigration ? (
          <p className="text-red-600 dark:text-red-400">
            Run{' '}
            <code className="rounded bg-red-100 px-1 py-0.5 dark:bg-red-900/40">npm run db:uploads</code>{' '}
            to create the table, then reload this page.
          </p>
        ) : (
          <p className="text-red-600 dark:text-red-400">
            Unable to load guest uploads. Please check the database connection and try again.
          </p>
        )}
      </div>
    )
  }
}

export default function AdminUploadsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Guest Uploads</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Photos and videos shared from the memories page. Links expire after 15 minutes; reload for fresh ones.
        </p>
      </div>

      <Suspense fallback={<LoadingUploads />}>
        <UploadsList />
      </Suspense>
    </div>
  )
}

import type { RSVP } from '@/types'
import { StatusBadge } from './status-badge'
import { GuestList } from './guest-list'
import { cn } from '@/lib/utils'

interface RSVPCardProps {
  rsvp: RSVP
  className?: string
}

export function RSVPCard({ rsvp, className }: RSVPCardProps) {
  // Check if this is a recent submission (within last 24 hours)
  const isRecent = Date.now() - new Date(rsvp.createdAt).getTime() < 24 * 60 * 60 * 1000

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-md',
        isRecent && 'border-l-4 border-l-green-500',
        className
      )}
    >
      {/* Header with name and status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center space-x-3 mb-2 sm:mb-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {rsvp.name}
          </h3>
          <StatusBadge isAttending={rsvp.isAttending} />
          {isRecent && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200">
              New
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <time dateTime={rsvp.createdAt.toISOString()}>
            {new Date(rsvp.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </time>
        </div>
      </div>

      {/* Contact and guest information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</p>
          <p className="text-gray-900 dark:text-white break-all">{rsvp.email}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Party Size</p>
          <p className="text-gray-900 dark:text-white">
            {rsvp.numberOfGuests} guest{rsvp.numberOfGuests !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Guest names */}
      {rsvp.isAttending && (
        <div className="mb-4">
          <GuestList
            guestNames={rsvp.guestNames}
            numberOfGuests={rsvp.numberOfGuests}
          />
        </div>
      )}

      {/* Notes */}
      {rsvp.notes && (
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Notes</p>
          <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
            &ldquo;{rsvp.notes}&rdquo;
          </p>
        </div>
      )}
    </div>
  )
}
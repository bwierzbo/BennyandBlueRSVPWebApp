import { cn } from '@/lib/utils'

interface GuestListProps {
  guestNames: string[] | null
  numberOfGuests: number
  className?: string
}

export function GuestList({ guestNames, numberOfGuests, className }: GuestListProps) {
  // Handle case where no guest names are provided
  if (!guestNames || guestNames.length === 0) {
    return (
      <div className={cn('text-sm', className)}>
        <p className="text-gray-500 dark:text-gray-400 mb-1">Guest Names</p>
        <p className="text-gray-400 dark:text-gray-500 italic">
          {numberOfGuests === 1 ? 'Guest name not provided' : `${numberOfGuests} guests - names not provided`}
        </p>
      </div>
    )
  }

  // Handle case where guest count exceeds provided names
  const hasUnnamedGuests = numberOfGuests > guestNames.length

  return (
    <div className={cn('', className)}>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Guest Names</p>
      <div className="flex flex-wrap gap-2">
        {guestNames.map((name, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            {name}
          </span>
        ))}
        {hasUnnamedGuests && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            +{numberOfGuests - guestNames.length} more guest{numberOfGuests - guestNames.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}
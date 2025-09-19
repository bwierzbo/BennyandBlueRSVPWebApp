import { cn } from '@/lib/utils'

interface TimestampDisplayProps {
  timestamp: Date | string
  className?: string
  showRelative?: boolean
}

export function TimestampDisplay({ timestamp, className, showRelative = false }: TimestampDisplayProps) {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp

  // Format absolute timestamp
  const absoluteFormat = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  // Calculate relative time
  const getRelativeTime = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSeconds < 60) {
      return 'Just now'
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    } else {
      return absoluteFormat
    }
  }

  const relativeTime = getRelativeTime(date)

  if (showRelative) {
    return (
      <time
        dateTime={date.toISOString()}
        className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
        title={absoluteFormat}
      >
        {relativeTime}
      </time>
    )
  }

  return (
    <time
      dateTime={date.toISOString()}
      className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
    >
      {absoluteFormat}
    </time>
  )
}
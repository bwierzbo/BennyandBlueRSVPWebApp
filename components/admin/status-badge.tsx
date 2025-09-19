import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  isAttending: boolean
  className?: string
}

export function StatusBadge({ isAttending, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        isAttending
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        className
      )}
      aria-label={isAttending ? 'Attending wedding' : 'Not attending wedding'}
    >
      <span className="mr-1" aria-hidden="true">
        {isAttending ? '✅' : '❌'}
      </span>
      {isAttending ? 'Attending' : 'Not Attending'}
    </span>
  )
}
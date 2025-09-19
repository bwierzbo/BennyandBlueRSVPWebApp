import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  className?: string
}

// Basic skeleton component
export function Skeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
      aria-label="Loading content"
    />
  )
}

// Stats cards skeleton
export function StatsCardsSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-12 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  )
}

// RSVP card skeleton
export function RSVPCardSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center space-x-3 mb-2 sm:mb-0">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Skeleton className="h-4 w-12 mb-1" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div>
          <Skeleton className="h-4 w-16 mb-1" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>

      {/* Guest names area */}
      <div className="mb-4">
        <Skeleton className="h-4 w-20 mb-2" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-6 w-32 rounded-md" />
          <Skeleton className="h-6 w-28 rounded-md" />
        </div>
      </div>

      {/* Notes area */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
        <Skeleton className="h-4 w-12 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

// List of RSVP cards skeleton
export function RSVPListSkeleton({ count = 5, className }: LoadingSkeletonProps & { count?: number }) {
  return (
    <div className={cn('space-y-4', className)}>
      <Skeleton className="h-8 w-48 mb-4" />
      {[...Array(count)].map((_, i) => (
        <RSVPCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Complete page skeleton
export function AdminPageSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-8', className)}>
      {/* Page header */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Stats cards */}
      <StatsCardsSkeleton />

      {/* RSVP list */}
      <RSVPListSkeleton />
    </div>
  )
}
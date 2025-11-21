import type { RSVPStats } from '@/types'
import { cn } from '@/lib/utils'

interface SummaryStatsProps {
  stats: RSVPStats
  className?: string
}

export function SummaryStats({ stats, className }: SummaryStatsProps) {
  // Calculate attendance rate
  const attendanceRate = stats.total_responses > 0
    ? (stats.attending_count / stats.total_responses) * 100
    : 0

  const statCards = [
    {
      title: 'Total RSVPs',
      value: stats.total_responses,
      color: 'blue',
      description: 'Total responses received'
    },
    {
      title: 'Attending',
      value: stats.attending_count,
      color: 'green',
      description: `${attendanceRate.toFixed(1)}% attendance rate`
    },
    {
      title: 'Not Attending',
      value: stats.not_attending_count,
      color: 'red',
      description: 'Declined invitations'
    },
    {
      title: 'Total Guests',
      value: stats.total_guests,
      color: 'purple',
      description: 'Sum of all party sizes'
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'text-blue-600 dark:text-blue-400',
      green: 'text-green-600 dark:text-green-400',
      red: 'text-red-600 dark:text-red-400',
      purple: 'text-purple-600 dark:text-purple-400'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {statCards.map((card) => (
        <div
          key={card.title}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {card.title}
              </p>
              <p className={cn('text-2xl font-bold', getColorClasses(card.color))}>
                {card.value}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            {card.description}
          </p>
        </div>
      ))}

      {/* Progress bar for attendance rate */}
      {stats.total_responses > 0 && (
        <div className="col-span-2 md:col-span-4 bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Attendance Progress
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {attendanceRate.toFixed(1)}%
            </p>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(attendanceRate, 100)}%` }}
              aria-label={`${attendanceRate.toFixed(1)}% attendance rate`}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>{stats.attending_count} attending</span>
            <span>{stats.not_attending_count} not attending</span>
          </div>
        </div>
      )}
    </div>
  )
}
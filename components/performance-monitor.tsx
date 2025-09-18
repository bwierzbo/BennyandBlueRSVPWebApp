"use client"

import { useState, useEffect } from 'react'
import { performanceMonitor, PERFORMANCE_TARGETS } from '@/lib/performance'

interface PerformanceStats {
  operation: string;
  count: number;
  averageDuration: number;
  maxDuration: number;
  target?: number;
}

export function PerformanceMonitor() {
  const [stats, setStats] = useState<PerformanceStats[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateStats = () => {
      const summary = performanceMonitor.getSummary()
      const statsArray: PerformanceStats[] = Object.entries(summary).map(([operation, data]) => ({
        operation,
        count: data.count,
        averageDuration: data.averageDuration,
        maxDuration: data.maxDuration,
        target: getTargetForOperation(operation)
      }))

      setStats(statsArray)
    }

    // Update stats every 5 seconds
    const interval = setInterval(updateStats, 5000)
    updateStats() // Initial update

    return () => clearInterval(interval)
  }, [])

  const getTargetForOperation = (operation: string): number | undefined => {
    if (operation.includes('guest_fields_render') || operation.includes('dynamic_guest_update')) {
      return PERFORMANCE_TARGETS.DYNAMIC_FIELD_RENDERING
    }
    if (operation.includes('form_submission')) {
      return PERFORMANCE_TARGETS.FORM_SUBMISSION
    }
    if (operation.includes('database') || operation.includes('rsvp_create') || operation.includes('email_lookup')) {
      return PERFORMANCE_TARGETS.DATABASE_OPERATION
    }
    if (operation.includes('guest_name_update')) {
      return PERFORMANCE_TARGETS.GUEST_FIELD_UPDATE
    }
    return undefined
  }

  const getStatusColor = (duration: number, target?: number): string => {
    if (!target) return 'text-gray-600'
    if (duration <= target) return 'text-green-600'
    if (duration <= target * 1.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const clearStats = () => {
    performanceMonitor.clearMetrics()
    setStats([])
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors z-50"
      >
        Show Performance
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md w-full z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-900">Performance Monitor</h3>
        <div className="flex gap-2">
          <button
            onClick={clearStats}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
          >
            Hide
          </button>
        </div>
      </div>

      {stats.length === 0 ? (
        <p className="text-gray-500 text-sm">No performance data yet</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {stats.map((stat) => (
            <div key={stat.operation} className="border-b border-gray-100 pb-2 last:border-b-0">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {stat.operation.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-gray-500">
                  {stat.count} calls
                </span>
              </div>

              <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Avg: </span>
                  <span className={getStatusColor(stat.averageDuration, stat.target)}>
                    {stat.averageDuration.toFixed(1)}ms
                  </span>
                  {stat.target && (
                    <span className="text-gray-400 ml-1">
                      (target: {stat.target}ms)
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-gray-600">Max: </span>
                  <span className={getStatusColor(stat.maxDuration, stat.target)}>
                    {stat.maxDuration.toFixed(1)}ms
                  </span>
                </div>
              </div>

              {stat.target && (
                <div className="mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full ${
                        stat.averageDuration <= stat.target
                          ? 'bg-green-500'
                          : stat.averageDuration <= stat.target * 1.5
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min((stat.averageDuration / (stat.target * 2)) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Performance targets:
          <div className="mt-1 space-y-1">
            <div>• Dynamic fields: &lt;{PERFORMANCE_TARGETS.DYNAMIC_FIELD_RENDERING}ms</div>
            <div>• Form submission: &lt;{PERFORMANCE_TARGETS.FORM_SUBMISSION}ms</div>
            <div>• Database ops: &lt;{PERFORMANCE_TARGETS.DATABASE_OPERATION}ms</div>
            <div>• Guest updates: &lt;{PERFORMANCE_TARGETS.GUEST_FIELD_UPDATE}ms</div>
          </div>
        </div>
      </div>
    </div>
  )
}
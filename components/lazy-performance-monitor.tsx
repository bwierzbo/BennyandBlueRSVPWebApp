"use client"

import { lazy, Suspense } from 'react'

// Lazy load the performance monitor to reduce initial bundle size
const PerformanceMonitor = lazy(() =>
  import('./performance-monitor').then(module => ({
    default: module.PerformanceMonitor
  }))
)

export function LazyPerformanceMonitor() {
  // Only load in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <Suspense fallback={
      <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-md text-sm z-50">
        Loading Performance Monitor...
      </div>
    }>
      <PerformanceMonitor />
    </Suspense>
  )
}
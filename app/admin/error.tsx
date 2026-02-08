"use client"

import Link from "next/link"
import { useEffect } from "react"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Admin dashboard error:", error)
  }, [error])

  return (
    <main className="min-h-screen bg-gradient-to-br from-wedding-dustyPink-50 to-wedding-lavender-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-wedding-lavender-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-wedding-lavender-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard Error
          </h1>
          <p className="text-gray-600">
            Something went wrong loading the dashboard.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full px-6 py-3 bg-wedding-roseGold-500 text-white font-medium rounded-lg hover:bg-wedding-roseGold-600 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/admin"
            className="text-wedding-roseGold-600 hover:text-wedding-roseGold-700 hover:underline font-medium"
          >
            Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}

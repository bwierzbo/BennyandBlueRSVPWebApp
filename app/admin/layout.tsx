import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Admin Dashboard - Benny & Blue Wedding',
  description: 'Wedding RSVP administration dashboard for managing guest responses and attendance',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Admin Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Wedding Admin
              </h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Benny & Blue - June 15, 2024
              </span>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                ← Back to Site
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="container mx-auto px-4 py-3">
          <div className="flex space-x-6">
            <Link
              href="/admin/guests"
              className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Guest List
            </Link>
            {/* Placeholder for future admin sections */}
            {/* TODO: Add authentication middleware when implemented */}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="mt-auto bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Admin Dashboard - Wedding Management System
          </p>
        </div>
      </footer>
    </div>
  )
}
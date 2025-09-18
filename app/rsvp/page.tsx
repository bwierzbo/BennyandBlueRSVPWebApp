import Link from "next/link"
import { RSVPFormServer } from "@/components/rsvp-form-server"
import { Button } from "@/components/ui/button"

export default function RSVPPage() {

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            RSVP to Our Wedding
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-2">
            Benny <span className="text-blue-600 dark:text-blue-400">&</span> Blue
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Please respond by May 1st, 2024
          </p>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
          <RSVPFormServer />
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
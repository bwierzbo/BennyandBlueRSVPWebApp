import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-wedding-dustyPink-50 to-wedding-lavender-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <p className="text-6xl font-bold text-wedding-roseGold-500 mb-4">
            404
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h1>
          <p className="text-gray-600">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-wedding-roseGold-500 text-white font-medium rounded-lg hover:bg-wedding-roseGold-600 transition-colors"
        >
          Go back to home page
        </Link>
      </div>
    </main>
  )
}

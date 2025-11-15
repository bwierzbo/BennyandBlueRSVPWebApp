'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ImageSection } from '@/components/ui'

function ThankYouContent() {
  const searchParams = useSearchParams()

  // Extract RSVP information from URL parameters if available
  const guestName = searchParams.get('name')
  const attending = searchParams.get('attending')
  const guestCount = searchParams.get('guests')
  const dietaryRestrictions = searchParams.get('dietary')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-wedding-dustyPink-50 to-white dark:from-wedding-dustyPink-950 dark:to-gray-900">
      <div className="max-w-4xl w-full text-center space-y-8">

        {/* Thank You Image Section */}
        <div className="mb-8">
          <ImageSection
            src="/images/thank-you-flowers.jpg"
            alt="Beautiful flowers expressing gratitude for your RSVP"
            imagePosition="top"
            className="max-w-2xl mx-auto"
            width={800}
            height={600}
            priority={true}
          />
        </div>

        {/* Header Section */}
        <div className="space-y-4">
          <div className="text-6xl">💕</div>
          <h1 className="text-4xl md:text-5xl font-bold text-wedding-dustyPink-900 dark:text-wedding-dustyPink-100">
            Thank You!
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300">
            Your RSVP has been successfully submitted
          </p>
        </div>

        {/* Wedding Details Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 border border-wedding-dustyPink-100 dark:border-wedding-dustyPink-800 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-wedding-dustyPink-900 dark:text-wedding-dustyPink-100 mb-4">
            Wedding Events
          </h2>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p><strong>Date:</strong> August 22, 2026</p>
            <p><strong>Cocktail Hour:</strong> 5:00 PM at Olympic Bluffs Cidery</p>
            <p><strong>Ceremony:</strong> 6:30 PM at Salt & Cedar bed and breakfast</p>
            <p><strong>Reception:</strong> 7:00 PM - 11:00 PM at Olympic Bluffs Lavender Shop</p>
            <p><strong>Brunch:</strong> August 23, 2026 at 11:00 AM (Location TBD)</p>
            <p className="pt-2"><strong>Venue:</strong> Olympic Bluffs Cidery & Lavender Farm<br />
            1025 Finn Hall Road, Port Angeles, WA 98362</p>
          </div>
        </div>

        {/* RSVP Summary (if information is available) */}
        {(guestName || attending || guestCount) && (
          <div className="bg-wedding-dustyPink-50 dark:bg-wedding-dustyPink-900/20 rounded-lg p-6 md:p-8 border border-wedding-dustyPink-200 dark:border-wedding-dustyPink-700 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-wedding-dustyPink-900 dark:text-wedding-dustyPink-100 mb-4">
              Your RSVP Summary
            </h2>
            <div className="space-y-2 text-left text-gray-700 dark:text-gray-300">
              {guestName && (
                <p><strong>Name:</strong> {decodeURIComponent(guestName)}</p>
              )}
              {attending && (
                <p><strong>Attending:</strong> {attending === 'true' ? 'Yes' : 'No'}</p>
              )}
              {guestCount && (
                <p><strong>Number of Guests:</strong> {guestCount}</p>
              )}
              {dietaryRestrictions && (
                <p><strong>Dietary Restrictions:</strong> {decodeURIComponent(dietaryRestrictions)}</p>
              )}
            </div>
          </div>
        )}

        {/* Next Steps Section */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 md:p-8 border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            What&apos;s Next?
          </h2>
          <div className="space-y-3 text-left text-gray-700 dark:text-gray-300">
            <p>• Your RSVP has been saved to our database</p>
            <p>• Check the <a href="/travel" className="text-wedding-dustyPink-600 dark:text-wedding-dustyPink-400 hover:underline">Travel & Accommodations</a> page for venue details and lodging options</p>
            <p>• Feel free to reach out if you have any questions</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Contact Us
          </h2>
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>Email:</strong> <a href="mailto:bwierzbo@gmail.com" className="text-wedding-dustyPink-600 dark:text-wedding-dustyPink-400 hover:underline">bwierzbo@gmail.com</a></p>
            <p><strong>Phone:</strong> <a href="tel:+15712713751" className="text-wedding-dustyPink-600 dark:text-wedding-dustyPink-400 hover:underline">(571) 271-3751</a></p>
          </div>
        </div>

        {/* Return to Main Page */}
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-wedding-dustyPink-600 hover:bg-wedding-dustyPink-700 dark:bg-wedding-dustyPink-500 dark:hover:bg-wedding-dustyPink-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            ← Return to Main Page
          </Link>
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-500 dark:text-gray-400 pt-8">
          We can&apos;t wait to celebrate with you!
        </p>
      </div>
    </main>
  )
}

export default function ThankYou() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">💕</div>
          <h1 className="text-4xl font-bold text-wedding-dustyPink-900 dark:text-wedding-dustyPink-100">
            Loading...
          </h1>
        </div>
      </main>
    }>
      <ThankYouContent />
    </Suspense>
  )
}
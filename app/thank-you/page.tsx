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
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950 dark:to-gray-900">
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
          <div className="text-6xl">💙</div>
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 dark:text-blue-100">
            Thank You!
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300">
            Your RSVP has been successfully submitted
          </p>
        </div>

        {/* Wedding Details Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 border border-blue-100 dark:border-blue-800 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Wedding Details
          </h2>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p><strong>Date:</strong> June 15, 2024</p>
            <p><strong>Ceremony:</strong> 4:00 PM at Sunset Gardens</p>
            <p><strong>Reception:</strong> 6:00 PM - 11:00 PM at Grand Ballroom</p>
            <p><strong>Address:</strong> 123 Wedding Lane, Celebration City, CA 90210</p>
          </div>
        </div>

        {/* RSVP Summary (if information is available) */}
        {(guestName || attending || guestCount) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 md:p-8 border border-blue-200 dark:border-blue-700 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
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
            <p>• You will receive a confirmation email shortly</p>
            <p>• Wedding details and directions will be sent closer to the date</p>
            <p>• Feel free to reach out if you have any questions</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Contact Us
          </h2>
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>Email:</strong> <a href="mailto:benny.blue.wedding@example.com" className="text-blue-600 dark:text-blue-400 hover:underline">benny.blue.wedding@example.com</a></p>
            <p><strong>Phone:</strong> <a href="tel:+1234567890" className="text-blue-600 dark:text-blue-400 hover:underline">(123) 456-7890</a></p>
          </div>
        </div>

        {/* Return to Main Page */}
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
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
          <div className="text-6xl mb-4">💙</div>
          <h1 className="text-4xl font-bold text-blue-900 dark:text-blue-100">
            Loading...
          </h1>
        </div>
      </main>
    }>
      <ThankYouContent />
    </Suspense>
  )
}
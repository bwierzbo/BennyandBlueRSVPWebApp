import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { HeroImage } from '@/components/ui'
import { formatDate } from '@/lib/utils'

export default function Home() {
  const weddingDate = new Date('2026-08-22T12:00:00-07:00') // Noon PDT to avoid timezone issues

  return (
    <main className="min-h-screen">
      {/* Hero Section with Image */}
      <HeroImage
        src="/images/hero.jpg"
        alt="Kourtney & Benjamin's Wedding"
        overlay="You're Invited to Kourtney & Benjamin's Wedding"
        className="h-screen"
        priority={true}
      />

      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-wedding-dustyPink-50 to-wedding-lavender-100 dark:from-gray-900 dark:to-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            {/* Names */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-4">
              Kourtney <span className="text-wedding-roseGold-600 dark:text-wedding-roseGold-400">&</span> Benjamin
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8">
              We&apos;re getting married and we want you there!
            </p>

            {/* Wedding Date */}
            <div className="mb-12">
              <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 mb-2">
                Save the Date
              </p>
              <p className="text-2xl sm:text-3xl font-semibold text-wedding-dustyPink-600 dark:text-wedding-dustyPink-400">
                {formatDate(weddingDate)}
              </p>
            </div>

            {/* RSVP Button */}
            <div className="mb-8">
              <Link href="/rsvp">
                <Button size="lg" className="text-lg px-8 py-4">
                  RSVP Now
                </Button>
              </Link>
            </div>

            {/* Venue Address */}
            <div className="mb-8">
              <p className="text-lg text-gray-700 dark:text-gray-200 mb-1">
                Olympic Bluffs Cidery & Lavender Farm
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                1025 Finn Hall Road, Port Angeles, WA 98362
              </p>
              <a
                href="https://www.google.com/maps/place/1025+Finn+Hall+Rd,+Port+Angeles,+WA+98362"
                target="_blank"
                rel="noopener noreferrer"
                className="text-wedding-roseGold-600 dark:text-wedding-roseGold-400 hover:underline"
              >
                View on Google Maps
              </a>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/travel">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Travel & Accommodations
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Wedding Events Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Wedding Events
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Cocktail Hour */}
              <div className="overflow-hidden bg-wedding-roseGold-50 dark:bg-gray-700 rounded-lg border border-wedding-roseGold-200">
                <div className="relative h-48 w-full">
                  <Image
                    src="/images/home-cidery-building.jpeg"
                    alt="Olympic Bluffs Cidery building"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-center p-6">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Cocktail Hour
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">
                    {formatDate(weddingDate)}
                  </p>
                  <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">
                    5:00 PM
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Olympic Bluffs Cidery
                  </p>
                </div>
              </div>

              {/* Ceremony */}
              <div className="overflow-hidden bg-wedding-dustyPink-50 dark:bg-gray-700 rounded-lg border border-wedding-dustyPink-200">
                <div className="relative h-48 w-full">
                  <Image
                    src="/images/bluffs.jpeg"
                    alt="Olympic Bluffs ceremony location"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-center p-6">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Ceremony
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">
                    {formatDate(weddingDate)}
                  </p>
                  <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">
                    6:30 PM
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Salt & Cedar Bed and Breakfast
                  </p>
                </div>
              </div>

              {/* Reception */}
              <div className="overflow-hidden bg-wedding-lavender-50 dark:bg-gray-700 rounded-lg border border-wedding-lavender-200">
                <div className="relative h-48 w-full">
                  <Image
                    src="/images/lavender-banner.jpg"
                    alt="Lavender field reception location"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-center p-6">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Reception
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">
                    {formatDate(weddingDate)}
                  </p>
                  <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">
                    7:00 PM - 11:00 PM
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Olympic Bluffs Lavender Shop
                  </p>
                </div>
              </div>

              {/* Brunch */}
              <div className="text-center p-6 bg-wedding-cream-200 dark:bg-gray-700 rounded-lg border border-wedding-cream-400">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Brunch
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">
                  August 23, 2026
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">
                  11:00 AM
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Location TBD
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registry Information Section */}
      <div className="bg-gradient-to-br from-wedding-lavender-50 to-wedding-dustyPink-50 dark:from-gray-800 dark:to-gray-700 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-wedding-lavender-200 dark:border-gray-600 p-8">
              <div className="flex justify-center mb-4">
                <svg className="w-12 h-12 text-wedding-roseGold-600 dark:text-wedding-roseGold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Registry Information
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">
                Our wedding registry will be available in <strong>February 2026</strong>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                (6 months prior to the wedding)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-wedding-dustyPink-600 dark:bg-wedding-dustyPink-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Can&apos;t wait to celebrate with you!
          </h2>
          <p className="text-xl text-wedding-dustyPink-100 mb-8">
            Please RSVP by July 1st, 2026
          </p>
          <Link href="/rsvp">
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 bg-white text-wedding-dustyPink-600 hover:bg-wedding-dustyPink-50 border-white"
            >
              RSVP Today
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
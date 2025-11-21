import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { HeroImage } from '@/components/ui'
import { formatDate } from '@/lib/utils'

function SectionDivider() {
  return (
    <div className="my-12 flex items-center justify-center animate-float-soft">
      <span className="h-px w-20 bg-gradient-to-r from-transparent via-wedding-roseGold-200 to-transparent" />
      <span className="mx-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md ring-1 ring-wedding-roseGold-200 dark:ring-wedding-roseGold-400/30">
        <svg
          className="h-6 w-6 text-wedding-roseGold-600 dark:text-wedding-roseGold-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6l-2.5 4.5h5L12 15" />
        </svg>
      </span>
      <span className="h-px w-20 bg-gradient-to-r from-transparent via-wedding-roseGold-200 to-transparent" />
    </div>
  )
}

export default function Home() {
  const weddingDate = new Date('2026-08-22T12:00:00-07:00') // Noon PDT to avoid timezone issues

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(212,160,86,0.08),transparent_35%),_radial-gradient(circle_at_80%_10%,rgba(213,145,185,0.08),transparent_30%),_linear-gradient(to_bottom_right,rgba(253,244,249,0.8),rgba(254,252,247,0.85))] dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Section with Image */}
      <HeroImage
        src="/images/hero.jpg"
        alt="Kourtney & Benjamin's Wedding"
        overlay="You're Invited to Kourtney & Benjamin's Wedding"
        className="min-h-[60vh] md:h-screen shadow-2xl"
        priority={true}
      />

      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-wedding-dustyPink-50/70 via-white to-wedding-lavender-100/70 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
            {/* Names */}
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-display font-bold text-gray-900 dark:text-white mb-4">
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
                className="text-wedding-roseGold-600 dark:text-wedding-roseGold-400 underline decoration-wedding-roseGold-300 decoration-2 underline-offset-4 animate-underline-pulse"
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

      <SectionDivider />

      {/* Wedding Events Section */}
      <div className="bg-white/90 dark:bg-gray-800 py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-center text-gray-900 dark:text-white mb-4">
              Wedding Events
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
              From golden hour cocktails to a lavender field reception, each moment is crafted to celebrate love and togetherness.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Cocktail Hour */}
              <div className="relative overflow-hidden bg-wedding-roseGold-50 dark:bg-gray-700 rounded-2xl border border-wedding-roseGold-200 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-wedding-roseGold-300">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/20 via-transparent to-wedding-roseGold-100/30" />
                <div className="relative h-40 sm:h-48 w-full">
                  <Image
                    src="/images/home-cidery-building.jpeg"
                    alt="Olympic Bluffs Cidery building"
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="text-center p-4 sm:p-6">
                  <h3 className="text-xl sm:text-2xl font-display font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
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
              <div className="relative overflow-hidden bg-wedding-dustyPink-50 dark:bg-gray-700 rounded-2xl border border-wedding-dustyPink-200 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-wedding-dustyPink-300">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/30 via-transparent to-wedding-dustyPink-100/30" />
                <div className="relative h-40 sm:h-48 w-full">
                  <Image
                    src="/images/bluffs.jpeg"
                    alt="Olympic Bluffs ceremony location"
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="text-center p-4 sm:p-6">
                  <h3 className="text-xl sm:text-2xl font-display font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
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
              <div className="relative overflow-hidden bg-wedding-lavender-50 dark:bg-gray-700 rounded-2xl border border-wedding-lavender-200 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-wedding-lavender-300">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/30 via-transparent to-wedding-lavender-100/30" />
                <div className="relative h-40 sm:h-48 w-full">
                  <Image
                    src="/images/lavender-banner.jpg"
                    alt="Lavender field reception location"
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="text-center p-4 sm:p-6">
                  <h3 className="text-xl sm:text-2xl font-display font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
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
              <div className="relative overflow-hidden bg-wedding-cream-200 dark:bg-gray-700 rounded-2xl border border-wedding-cream-400 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-wedding-cream-500">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/50 via-transparent to-wedding-cream-200/70" />
                <div className="relative h-40 sm:h-48 w-full bg-gradient-to-br from-wedding-cream-100 to-wedding-cream-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 sm:w-20 h-16 sm:h-20 text-wedding-cream-600 dark:text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm00V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                    <p className="text-xs sm:text-sm text-wedding-cream-700 dark:text-gray-300 font-medium">Brunch Details Coming Soon</p>
                  </div>
                </div>
                <div className="text-center p-4 sm:p-6">
                  <h3 className="text-xl sm:text-2xl font-display font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
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
      </div>

      <SectionDivider />

      {/* Registry Information Section */}
      <div className="bg-gradient-to-br from-wedding-lavender-50 to-wedding-dustyPink-50 dark:from-gray-800 dark:to-gray-700 py-8 md:py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\"160\" height=\"160\" viewBox=\"0 0 160 160\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cdefs%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"4\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3C/defs%3E%3Crect width=\"160\" height=\"160\" filter=\"url(%23noise)\" opacity=\"0.16\"/%3E%3C/svg%3E"' }} aria-hidden />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-wedding-lavender-200 dark:border-gray-600 p-6 sm:p-8 animate-fade-in-up">
              <div className="flex justify-center mb-4">
                <svg className="w-12 h-12 text-wedding-roseGold-600 dark:text-wedding-roseGold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">
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
      <div className="bg-wedding-dustyPink-600 dark:bg-wedding-dustyPink-800 py-8 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.6),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(240,200,170,0.45),transparent_40%)]" aria-hidden />
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Can&apos;t wait to celebrate with you!
          </h2>
          <p className="text-xl text-wedding-dustyPink-100 mb-8">
            Please RSVP by July 1st, 2026
          </p>
          <Link href="/rsvp">
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 bg-white text-wedding-dustyPink-600 hover:bg-wedding-dustyPink-50 border-white shadow-lg"
            >
              RSVP Today
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

import Link from 'next/link'
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
        alt="Benny & Blue's Wedding"
        overlay="You're Invited - Benny & Blue's Wedding"
        className="h-screen"
        priority={true}
      />

      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-wedding-dustyPink-50 to-wedding-lavender-100 dark:from-gray-900 dark:to-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            {/* Names */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-4">
              Benny <span className="text-wedding-roseGold-600 dark:text-wedding-roseGold-400">&</span> Blue
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
          </div>
        </div>
      </div>

      {/* Wedding Details Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Wedding Details
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Ceremony */}
              <div className="text-center p-6 bg-wedding-dustyPink-50 dark:bg-gray-700 rounded-lg border border-wedding-dustyPink-200">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Ceremony
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">
                  {formatDate(weddingDate)}
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">
                  4:00 PM
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Sunset Gardens<br />
                  123 Wedding Lane<br />
                  Celebration City, CA 90210
                </p>
              </div>

              {/* Reception */}
              <div className="text-center p-6 bg-wedding-lavender-50 dark:bg-gray-700 rounded-lg border border-wedding-lavender-200">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Reception
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">
                  {formatDate(weddingDate)}
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">
                  6:00 PM - 11:00 PM
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Grand Ballroom<br />
                  Celebration Hotel<br />
                  456 Party Avenue<br />
                  Celebration City, CA 90210
                </p>
              </div>
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
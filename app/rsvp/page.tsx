import Link from "next/link"
import Image from "next/image"
import { PageBanner, Button } from "@/components/ui"
import { LazyPerformanceMonitor } from "@/components/lazy-performance-monitor"
import { RSVPPageClient } from "@/components/rsvp-page-client"
import { getRSVPDeadline, isRSVPOpen, formatDate } from "@/lib/utils"

export default function RSVPPage() {
  const deadline = getRSVPDeadline()
  const open = isRSVPOpen()

  return (
    <main className="min-h-screen bg-gradient-to-br from-wedding-dustyPink-50 to-wedding-lavender-100 dark:from-gray-900 dark:to-gray-800">
      {/* Decorative Banner */}
      <PageBanner
        src="/images/floral-banner.jpeg"
        alt="Elegant floral wedding banner with romantic flowers"
        height={300}
        className="rounded-b-lg shadow-sm"
        priority={true}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/images/rsvp-card-icon.png"
              alt="RSVP card icon"
              width={40}
              height={40}
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              RSVP to Our Wedding
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-2">
            Benny <span className="text-wedding-roseGold-600 dark:text-wedding-roseGold-400">&amp;</span> Blue
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Please respond by {formatDate(deadline)}
          </p>
        </div>

        {open ? (
          <RSVPPageClient />
        ) : (
          <>
            {/* RSVP Closed Message */}
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 sm:p-10 text-center">
              <div className="mb-4 text-4xl">💌</div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                RSVPs Are Now Closed
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                The RSVP deadline was {formatDate(deadline)}.
              </p>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                If you still need to respond, please contact us directly and we&apos;ll do our best to accommodate you.
              </p>
              <Link href="/">
                <Button variant="outline" size="sm">
                  ← Back to Home
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Performance Monitor - Lazy loaded for development */}
      <LazyPerformanceMonitor />
    </main>
  )
}

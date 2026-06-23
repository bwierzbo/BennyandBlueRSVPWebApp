import Image from "next/image"
import { PageBanner } from "@/components/ui"
import { LazyPerformanceMonitor } from "@/components/lazy-performance-monitor"
import { RSVPPageClient } from "@/components/rsvp-page-client"

export default function RSVPPage() {
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
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            Benny <span className="text-wedding-roseGold-600 dark:text-wedding-roseGold-400">&amp;</span> Blue
          </p>
        </div>

        <RSVPPageClient />
      </div>

      {/* Performance Monitor - Lazy loaded for development */}
      <LazyPerformanceMonitor />
    </main>
  )
}

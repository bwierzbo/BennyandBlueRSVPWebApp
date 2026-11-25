import type { Metadata } from 'next'
import Link from 'next/link'
import { Button, PageBanner } from '@/components/ui'
import { MemoriesUploader } from '@/components/memories-uploader'

export const metadata: Metadata = {
  title: 'Memories | Kourtney & Benjamin',
  description:
    "Watch Kourtney & Benjamin's wedding film and share your photos and videos from the weekend.",
}

const cardClassName =
  'bg-white/90 dark:bg-gray-800 rounded-2xl border shadow-md p-5 sm:p-10 mb-8 sm:mb-10'
const headingClassName =
  'text-2xl sm:text-3xl font-display font-bold text-wedding-deepPurple-900 dark:text-white mb-4'

function Film() {
  const mp4Url = process.env.NEXT_PUBLIC_FILM_MP4_URL
  const youtubeId = process.env.NEXT_PUBLIC_FILM_YOUTUBE_ID

  if (mp4Url) {
    return (
      <video
        controls
        playsInline
        preload="metadata"
        src={mp4Url}
        className="aspect-video w-full rounded-xl bg-black"
      />
    )
  }

  if (youtubeId) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?rel=0&modestbranding=1`}
        title="Kourtney & Benjamin's wedding film"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="aspect-video w-full rounded-xl bg-black"
      />
    )
  }

  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-wedding-roseGold-200 bg-wedding-cream-200 px-4 text-center dark:border-gray-700 dark:bg-gray-900">
      <p className="font-display text-xl font-semibold text-wedding-deepPurple-900 dark:text-white sm:text-2xl">
        Film coming soon
      </p>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 sm:text-base">
        We&apos;re putting the finishing touches on it. Check back shortly.
      </p>
    </div>
  )
}

export default function Memories() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(212,160,86,0.08),transparent_35%),_radial-gradient(circle_at_80%_10%,rgba(213,145,185,0.08),transparent_30%),_linear-gradient(to_bottom_right,rgba(253,244,249,0.8),rgba(254,252,247,0.85))] dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-800"
    >
      <PageBanner
        src="/images/floral-banner.jpeg"
        alt="Floral wedding banner"
        height={140}
        className="rounded-b-lg shadow-sm"
        priority={true}
      />

      <div className="container mx-auto px-4 py-8 md:py-14">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-wedding-deepPurple-900 dark:text-white mb-4">
              Thank you for celebrating with us
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
              Relive the day with our film, and share the moments you captured.
            </p>
          </div>

          <section className={`${cardClassName} border-wedding-lavender-200 dark:border-gray-700`}>
            <h2 className={headingClassName}>Watch our film</h2>
            <Film />
          </section>

          <section className={`${cardClassName} border-wedding-dustyPink-200 dark:border-gray-700`}>
            <h2 className={headingClassName}>Share your photos &amp; videos</h2>
            <MemoriesUploader />
          </section>

          <div className="flex justify-center">
            <Link href="/">
              <Button variant="outline" size="lg">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

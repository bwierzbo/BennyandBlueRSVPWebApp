"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { RSVPForm } from "@/components/rsvp-form"
import { LazyPerformanceMonitor } from "@/components/lazy-performance-monitor"
import { Button, PageBanner } from "@/components/ui"
import { submitRSVPJSON } from "@/lib/actions"
import type { RSVPFormData } from "@/lib/validations"

export default function RSVPPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (data: RSVPFormData) => {
    setIsSubmitting(true)
    try {
      console.log('Submitting RSVP...', data)
      const result = await submitRSVPJSON(data)
      console.log('RSVP submission result:', result)

      // If we get here, there was a validation error (success redirects)
      if (result && !result.success) {
        console.error('RSVP submission failed:', result.errors)
        // Let the form handle displaying errors
        throw new Error(result.errors?.[0]?.message || "Failed to submit RSVP")
      }

      // If result is undefined or success is true but no redirect happened,
      // something unexpected occurred
      if (!result) {
        throw new Error("Unexpected error during submission")
      }
    } catch (error) {
      // Don't log or handle redirect errors - they're expected
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        throw error
      }
      console.error('RSVP submission error:', error)
      // Re-throw error to let form component handle it
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

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
            Benny <span className="text-wedding-roseGold-600 dark:text-wedding-roseGold-400">&</span> Blue
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Please respond by July 1st, 2026
          </p>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
          <RSVPForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
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

      {/* Performance Monitor - Lazy loaded for development */}
      <LazyPerformanceMonitor />
    </main>
  )
}
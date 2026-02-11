"use client"

import Link from "next/link"
import { useState } from "react"
import { RSVPForm } from "@/components/rsvp-form"
import { Button } from "@/components/ui"
import { submitRSVPJSON } from "@/lib/actions"
import type { RSVPFormData } from "@/lib/validations"

export function RSVPPageClient() {
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    <>
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
    </>
  )
}

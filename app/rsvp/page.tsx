"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { RSVPForm } from "@/components/rsvp-form"
import { Button } from "@/components/ui/button"
import { submitRSVPJSON } from "@/lib/actions"
import type { RSVPFormData } from "@/lib/validations"

export default function RSVPPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (data: RSVPFormData) => {
    setIsSubmitting(true)
    try {
      const result = await submitRSVPJSON(data)

      if (result.success) {
        // Redirect to thank you page on success
        router.push("/thank-you?success=true")
      } else {
        // Let the form handle displaying errors
        throw new Error(result.errors?.[0]?.message || "Failed to submit RSVP")
      }
    } catch (error) {
      // Re-throw error to let form component handle it
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            RSVP to Our Wedding
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-2">
            Benny <span className="text-blue-600 dark:text-blue-400">&</span> Blue
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Please respond by May 1st, 2024
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
    </main>
  )
}
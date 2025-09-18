"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { RSVPForm } from "@/components/rsvp-form"
import { Button } from "@/components/ui/button"
import { type RSVPFormData } from "@/lib/validations"

export default function RSVPPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (data: RSVPFormData) => {
    setIsSubmitting(true)

    try {
      // TODO: Replace with actual server action when ready
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to submit RSVP")
      }

      // Redirect to thank you page on success
      router.push("/thank-you")
    } catch (error) {
      // Re-throw error to be handled by the form component
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
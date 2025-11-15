'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function TestEmailButton() {
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSendTestEmail = async () => {
    setIsSending(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        setResult({
          success: true,
          message: 'Test email sent successfully! Check bwierzbo@gmail.com',
        })
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to send test email',
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-3">
        <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg mr-3">
          <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Test Email System
        </h4>
      </div>

      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
        Send a test RSVP confirmation email to bwierzbo@gmail.com to verify the email service is working.
      </p>

      <Button
        onClick={handleSendTestEmail}
        disabled={isSending}
        className="w-full"
      >
        {isSending ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending Test Email...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Send Test Email
          </>
        )}
      </Button>

      {result && (
        <div className={`mt-4 p-4 rounded-lg ${
          result.success
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-start">
            {result.success ? (
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <p className={`text-sm ${
              result.success
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }`}>
              {result.message}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useTransition } from 'react'
import { deleteRSVP } from '@/lib/actions'
import { Button } from '@/components/ui/button'

interface DeleteRSVPButtonProps {
  rsvpId: number
  rsvpName: string
}

export function DeleteRSVPButton({ rsvpId, rsvpName }: DeleteRSVPButtonProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteRSVP(rsvpId)

        if (!result.success) {
          setError(result.errors?.[0]?.message || 'Failed to delete RSVP')
          setShowConfirmation(false)
        } else {
          // Success - the page will automatically update due to revalidation
          setShowConfirmation(false)
        }
      } catch (err) {
        setError('An unexpected error occurred')
        setShowConfirmation(false)
      }
    })
  }

  if (showConfirmation) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Delete {rsvpName}?
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isPending}
        >
          {isPending ? 'Deleting...' : 'Confirm'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfirmation(false)}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="mb-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setError(null)
          setShowConfirmation(true)
        }}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        Delete
      </Button>
    </div>
  )
}

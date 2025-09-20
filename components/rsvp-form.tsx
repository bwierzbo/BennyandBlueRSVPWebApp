"use client"

import { useState, useEffect, useMemo, useCallback, memo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { rsvpFormSchema, type RSVPFormData } from "@/lib/validations"
import { formatErrorForDisplay } from "@/lib/error-messages"
import { performanceMonitor, usePerformanceMonitor, memoryMonitor, PERFORMANCE_TARGETS } from "@/lib/performance"

interface RSVPFormProps {
  onSubmit: (data: RSVPFormData) => Promise<void>
  isSubmitting?: boolean
}

// Venue Disclaimer Component - Memoized to prevent unnecessary re-renders
const VenueDisclaimer = memo(function VenueDisclaimer() {
  return (
    <div className="p-4 bg-wedding-roseGold-50 border border-wedding-roseGold-200 rounded-md">
      <div className="flex items-start">
        <svg className="w-5 h-5 text-wedding-roseGold-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div>
          <h4 className="text-sm font-medium text-wedding-roseGold-800 mb-1">Venue Age Restriction</h4>
          <p className="text-sm text-wedding-roseGold-700">
            Please note that our venue has an age restriction policy. All guests must be 18 years or older.
            We appreciate your understanding and look forward to celebrating with you!
          </p>
        </div>
      </div>
    </div>
  )
})

export function RSVPForm({ onSubmit, isSubmitting = false }: RSVPFormProps) {
  // Performance monitoring for this component
  const { startTiming, endTiming } = usePerformanceMonitor('RSVPForm')

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [guestNames, setGuestNames] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(rsvpFormSchema),
    mode: "onChange" as const,
    defaultValues: {
      numberOfGuests: 0,
      guestNames: [],
    }
  })

  const attendance = watch("attendance")
  const numberOfGuests = watch("numberOfGuests")

  // Memoize guest count to reduce unnecessary calculations
  const currentGuestCount = useMemo(() => numberOfGuests || 0, [numberOfGuests])

  // Memoize attendance state to prevent unnecessary renders
  const isAttending = useMemo(() => attendance === "yes", [attendance])

  // Optimized dynamic guest management with performance monitoring
  useEffect(() => {
    startTiming('dynamic_guest_update')

    // Use memoized values to reduce recalculations
    if (isAttending && currentGuestCount > 0) {
      // Update guest names array to match guest count
      const newGuestNames = [...guestNames]

      if (currentGuestCount > guestNames.length) {
        // Add empty slots for new guests efficiently
        const emptySlots = Array(currentGuestCount - guestNames.length).fill("")
        newGuestNames.push(...emptySlots)
      } else if (currentGuestCount < guestNames.length) {
        // Remove excess guest names
        newGuestNames.splice(currentGuestCount)
      }

      // Only update if there's an actual change to prevent unnecessary renders
      if (JSON.stringify(newGuestNames) !== JSON.stringify(guestNames)) {
        setGuestNames(newGuestNames)
        setValue("guestNames", newGuestNames)
      }
    } else if (!isAttending || currentGuestCount === 0) {
      // Clear all guest fields when not attending or no guests
      if (guestNames.length > 0) {
        setGuestNames([])
        setValue("guestNames", [])
      }
      if (!isAttending && numberOfGuests !== 0) {
        setValue("numberOfGuests", 0)
      }
    }

    endTiming('dynamic_guest_update')
  }, [isAttending, currentGuestCount, setValue, guestNames, numberOfGuests, startTiming, endTiming])

  // Optimized guest name update with performance monitoring
  const updateGuestName = useCallback((index: number, name: string) => {
    startTiming('guest_name_update')

    // Use functional update to ensure we have the latest state
    setGuestNames(currentNames => {
      const newGuestNames = [...currentNames]
      newGuestNames[index] = name
      setValue("guestNames", newGuestNames)

      endTiming('guest_name_update', {
        index,
        nameLength: name.length,
        totalGuests: newGuestNames.length
      })

      return newGuestNames
    })
  }, [setValue, startTiming, endTiming])

  // Memoized guest field component for optimal rendering
  const GuestField = memo(function GuestField({ index, name, error, onUpdate }: {
    index: number;
    name: string;
    error?: any;
    onUpdate: (index: number, value: string) => void
  }) {
    return (
    <div className="space-y-2 mb-3">
      <Label htmlFor={`guest-${index}`} className="text-sm">
        Guest {index + 1} Name *
      </Label>
      <Input
        id={`guest-${index}`}
        value={name}
        onChange={(e) => onUpdate(index, e.target.value)}
        placeholder={`Enter guest ${index + 1} name`}
        className={error ? "border-red-500" : ""}
      />
      {error && (
        <p className="text-sm text-red-500">
          {error.message}
        </p>
      )}
    </div>
    )
  })

  // Memoized guest fields list for performance
  const guestFields = useMemo(() => {
    if (!isAttending || currentGuestCount === 0) return null

    startTiming('guest_fields_render')

    const fields = guestNames.map((name, index) => (
      <GuestField
        key={`guest-${index}`}
        index={index}
        name={name}
        error={errors.guestNames?.[index]}
        onUpdate={updateGuestName}
      />
    ))

    endTiming('guest_fields_render', { guestCount: guestNames.length })
    return fields
  }, [guestNames, errors.guestNames, isAttending, currentGuestCount, updateGuestName, startTiming, endTiming, GuestField])

  // Optimized form submission with performance monitoring and memory optimization
  const onFormSubmit = useCallback(async (data: any) => {
    startTiming('form_submission')

    try {
      setSubmitError(null)

      // Memory-optimized form data preparation
      const formData = memoryMonitor.monitorMemoryDuringOperation('form_data_preparation', () => ({
        ...data,
        guestNames: guestNames.length > 0 ? guestNames : undefined // Avoid empty arrays
      }))

      await onSubmit(formData as RSVPFormData)

      endTiming('form_submission', {
        hasGuests: guestNames.length > 0,
        guestCount: guestNames.length,
        formDataSize: JSON.stringify(formData).length
      })
    } catch (error) {
      endTiming('form_submission', { error: true })
      setSubmitError(formatErrorForDisplay(error))
    }
  }, [guestNames, onSubmit, startTiming, endTiming])

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-w-lg mx-auto">
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Enter your full name"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="Enter your email address"
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Attendance Field */}
      <div className="space-y-2">
        <Label>Will you be attending? *</Label>
        <div className="flex gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              value="yes"
              {...register("attendance")}
              className="w-4 h-4 text-blue-600"
            />
            <span>Yes, I&apos;ll be there!</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              value="no"
              {...register("attendance")}
              className="w-4 h-4 text-blue-600"
            />
            <span>Sorry, can&apos;t make it</span>
          </label>
        </div>
        {errors.attendance && (
          <p className="text-sm text-red-500">{errors.attendance.message}</p>
        )}
      </div>

      {/* Guest Count Field - Only show if attending */}
      {isAttending && (
        <div className="space-y-2">
          <Label htmlFor="numberOfGuests">Number of Additional Guests</Label>
          <Input
            id="numberOfGuests"
            type="number"
            min="0"
            max="10"
            {...register("numberOfGuests", { valueAsNumber: true })}
            placeholder="0"
            className={errors.numberOfGuests ? "border-red-500" : ""}
          />
          <p className="text-sm text-gray-500">Maximum 10 guests allowed</p>
          {errors.numberOfGuests && (
            <p className="text-sm text-red-500">{errors.numberOfGuests.message}</p>
          )}
        </div>
      )}

      {/* Dynamic Guest Name Fields - Optimized rendering */}
      {guestFields && (
        <div className="space-y-4">
          <div className="border-t pt-4">
            <Label className="text-base font-medium">Guest Names</Label>
            <p className="text-sm text-gray-500 mb-4">
              Please provide the full names of your guests
            </p>
            {guestFields}
            {errors.guestNames && !Array.isArray(errors.guestNames) && (
              <p className="text-sm text-red-500">{errors.guestNames.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Venue Disclaimer - Only show if attending */}
      {isAttending && (
        <VenueDisclaimer />
      )}

      {/* Dietary Restrictions Field - Only show if attending */}
      {isAttending && (
        <div className="space-y-2">
          <Label htmlFor="dietaryRestrictions">Dietary Restrictions or Allergies</Label>
          <Textarea
            id="dietaryRestrictions"
            {...register("dietaryRestrictions")}
            placeholder="Please let us know about any dietary restrictions or allergies"
            className={errors.dietaryRestrictions ? "border-red-500" : ""}
          />
          {errors.dietaryRestrictions && (
            <p className="text-sm text-red-500">{errors.dietaryRestrictions.message}</p>
          )}
        </div>
      )}

      {/* Notes Field */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes or Messages</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Any special messages for the happy couple?"
          className={errors.notes ? "border-red-500" : ""}
        />
        {errors.notes && (
          <p className="text-sm text-red-500">{errors.notes.message}</p>
        )}
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? "Submitting RSVP..." : "Submit RSVP"}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        * Required fields
      </p>
    </form>
  )
}
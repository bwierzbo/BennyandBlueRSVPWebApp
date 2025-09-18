"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { rsvpFormSchema, type RSVPFormData } from "@/lib/validations"
import { formatErrorForDisplay } from "@/lib/error-messages"

interface RSVPFormProps {
  onSubmit: (data: RSVPFormData) => Promise<void>
  isSubmitting?: boolean
}

// Venue Disclaimer Component
function VenueDisclaimer() {
  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
      <div className="flex items-start">
        <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div>
          <h4 className="text-sm font-medium text-amber-800 mb-1">Venue Age Restriction</h4>
          <p className="text-sm text-amber-700">
            Please note that our venue has an age restriction policy. All guests must be 18 years or older.
            We appreciate your understanding and look forward to celebrating with you!
          </p>
        </div>
      </div>
    </div>
  )
}

export function RSVPForm({ onSubmit, isSubmitting = false }: RSVPFormProps) {
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

  // Dynamic guest management
  useEffect(() => {
    const currentGuestCount = numberOfGuests || 0

    if (attendance === "yes" && currentGuestCount > 0) {
      // Update guest names array to match guest count
      const newGuestNames = [...guestNames]

      if (currentGuestCount > guestNames.length) {
        // Add empty slots for new guests
        for (let i = guestNames.length; i < currentGuestCount; i++) {
          newGuestNames.push("")
        }
      } else if (currentGuestCount < guestNames.length) {
        // Remove excess guest names
        newGuestNames.splice(currentGuestCount)
      }

      setGuestNames(newGuestNames)
      setValue("guestNames", newGuestNames)
    } else if (attendance === "no" || currentGuestCount === 0) {
      // Clear all guest fields when not attending or no guests
      setGuestNames([])
      setValue("guestNames", [])
      if (attendance === "no") {
        setValue("numberOfGuests", 0)
      }
    }
  }, [attendance, numberOfGuests, setValue, guestNames])

  const updateGuestName = (index: number, name: string) => {
    const newGuestNames = [...guestNames]
    newGuestNames[index] = name
    setGuestNames(newGuestNames)
    setValue("guestNames", newGuestNames)
  }

  const onFormSubmit = async (data: any) => {
    try {
      setSubmitError(null)
      // Ensure guest names are included in the data
      const formData = {
        ...data,
        guestNames: guestNames
      }
      await onSubmit(formData as RSVPFormData)
    } catch (error) {
      setSubmitError(formatErrorForDisplay(error))
    }
  }

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
      {attendance === "yes" && (
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

      {/* Dynamic Guest Name Fields - Only show if attending with guests */}
      {attendance === "yes" && (numberOfGuests || 0) > 0 && (
        <div className="space-y-4">
          <div className="border-t pt-4">
            <Label className="text-base font-medium">Guest Names</Label>
            <p className="text-sm text-gray-500 mb-4">
              Please provide the full names of your guests
            </p>
            {guestNames.map((name, index) => (
              <div key={index} className="space-y-2 mb-3">
                <Label htmlFor={`guest-${index}`} className="text-sm">
                  Guest {index + 1} Name *
                </Label>
                <Input
                  id={`guest-${index}`}
                  value={name}
                  onChange={(e) => updateGuestName(index, e.target.value)}
                  placeholder={`Enter guest ${index + 1} name`}
                  className={errors.guestNames?.[index] ? "border-red-500" : ""}
                />
                {errors.guestNames?.[index] && (
                  <p className="text-sm text-red-500">
                    {errors.guestNames[index]?.message}
                  </p>
                )}
              </div>
            ))}
            {errors.guestNames && !Array.isArray(errors.guestNames) && (
              <p className="text-sm text-red-500">{errors.guestNames.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Venue Disclaimer - Only show if attending */}
      {attendance === "yes" && (
        <VenueDisclaimer />
      )}

      {/* Dietary Restrictions Field - Only show if attending */}
      {attendance === "yes" && (
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
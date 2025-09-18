"use client"

import { useState } from "react"
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

export function RSVPForm({ onSubmit, isSubmitting = false }: RSVPFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(rsvpFormSchema),
    mode: "onChange" as const,
    defaultValues: {
      guestCount: 0,
    }
  })

  const attendance = watch("attendance")

  const onFormSubmit = async (data: any) => {
    try {
      setSubmitError(null)
      await onSubmit(data)
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
          <Label htmlFor="guestCount">Number of Additional Guests</Label>
          <Input
            id="guestCount"
            type="number"
            min="0"
            max="5"
            {...register("guestCount", { valueAsNumber: true })}
            placeholder="0"
            className={errors.guestCount ? "border-red-500" : ""}
          />
          <p className="text-sm text-gray-500">Maximum 5 additional guests allowed</p>
          {errors.guestCount && (
            <p className="text-sm text-red-500">{errors.guestCount.message}</p>
          )}
        </div>
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitRSVPAndRedirect } from "@/lib/actions"

export function RSVPFormServer() {

  return (
    <form action={submitRSVPAndRedirect} className="space-y-6 max-w-lg mx-auto">
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Enter your full name"
        />
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Enter your email address"
        />
      </div>

      {/* Attendance Field */}
      <div className="space-y-2">
        <Label>Will you be attending? *</Label>
        <div className="flex gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="attendance"
              value="yes"
              required
              className="w-4 h-4 text-blue-600"
            />
            <span>Yes, I&apos;ll be there!</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="attendance"
              value="no"
              required
              className="w-4 h-4 text-blue-600"
            />
            <span>Sorry, can&apos;t make it</span>
          </label>
        </div>
      </div>

      {/* Guest Count Field */}
      <div className="space-y-2">
        <Label htmlFor="guestCount">Number of Additional Guests</Label>
        <Input
          id="guestCount"
          name="guestCount"
          type="number"
          min="0"
          max="5"
          defaultValue="0"
          placeholder="0"
        />
        <p className="text-sm text-gray-500">Maximum 5 additional guests allowed</p>
      </div>

      {/* Dietary Restrictions Field */}
      <div className="space-y-2">
        <Label htmlFor="dietaryRestrictions">Dietary Restrictions or Allergies</Label>
        <Textarea
          id="dietaryRestrictions"
          name="dietaryRestrictions"
          placeholder="Please let us know about any dietary restrictions or allergies"
        />
      </div>

      {/* Notes Field */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes or Messages</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Any special messages for the happy couple?"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
      >
        Submit RSVP
      </Button>

      <p className="text-xs text-gray-500 text-center">
        * Required fields
      </p>
    </form>
  )
}
import {
  validateRSVPForm,
  validateCompleteRSVP,
  validateEmail,
  transformZodErrors,
  rsvpFormSchema,
  type RSVPFormData,
} from '../validations'
import { z } from 'zod'

describe('RSVP Form Validation', () => {
  // Valid test data
  const validRSVPData: RSVPFormData = {
    name: 'John Doe',
    email: 'john@example.com',
    attendance: 'yes',
    guestCount: 2,
    dietaryRestrictions: 'Vegetarian',
    notes: 'Looking forward to the celebration!',
  }

  describe('validateRSVPForm', () => {
    it('should validate correct RSVP data', async () => {
      const result = await validateRSVPForm(validRSVPData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validRSVPData)
      expect(result.errors).toBeUndefined()
    })

    it('should reject invalid name', async () => {
      const invalidData = { ...validRSVPData, name: '' }
      const result = await validateRSVPForm(invalidData)
      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors![0].field).toBe('name')
    })

    it('should reject invalid email', async () => {
      const invalidData = { ...validRSVPData, email: 'not-an-email' }
      const result = await validateRSVPForm(invalidData)
      expect(result.success).toBe(false)
      expect(result.errors![0].field).toBe('email')
    })

    it('should reject missing attendance', async () => {
      const invalidData = { ...validRSVPData }
      delete (invalidData as any).attendance
      const result = await validateRSVPForm(invalidData)
      expect(result.success).toBe(false)
      expect(result.errors![0].field).toBe('attendance')
    })

    it('should reject negative guest count', async () => {
      const invalidData = { ...validRSVPData, guestCount: -1 }
      const result = await validateRSVPForm(invalidData)
      expect(result.success).toBe(false)
      expect(result.errors![0].field).toBe('guestCount')
    })

    it('should reject too many guests', async () => {
      const invalidData = { ...validRSVPData, guestCount: 10 }
      const result = await validateRSVPForm(invalidData)
      expect(result.success).toBe(false)
      expect(result.errors![0].field).toBe('guestCount')
    })

    it('should reject too long dietary restrictions', async () => {
      const invalidData = { ...validRSVPData, dietaryRestrictions: 'x'.repeat(501) }
      const result = await validateRSVPForm(invalidData)
      expect(result.success).toBe(false)
      expect(result.errors![0].field).toBe('dietaryRestrictions')
    })

    it('should reject too long notes', async () => {
      const invalidData = { ...validRSVPData, notes: 'x'.repeat(1001) }
      const result = await validateRSVPForm(invalidData)
      expect(result.success).toBe(false)
      expect(result.errors![0].field).toBe('notes')
    })

    it('should allow optional fields to be undefined', async () => {
      const minimalData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        attendance: 'no' as const,
        guestCount: 0,
      }
      const result = await validateRSVPForm(minimalData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        ...minimalData,
        dietaryRestrictions: undefined,
        notes: undefined,
      })
    })
  })

  describe('validateEmail', () => {
    it('should validate correct email', async () => {
      const result = await validateEmail({ email: 'test@example.com' })
      expect(result.success).toBe(true)
      expect(result.data?.email).toBe('test@example.com')
    })

    it('should reject invalid email format', async () => {
      const result = await validateEmail({ email: 'invalid-email' })
      expect(result.success).toBe(false)
      expect(result.errors![0].field).toBe('email')
    })

    it('should reject empty email', async () => {
      const result = await validateEmail({ email: '' })
      expect(result.success).toBe(false)
      expect(result.errors![0].field).toBe('email')
    })

    it('should reject too long email', async () => {
      const longEmail = 'x'.repeat(250) + '@example.com'
      const result = await validateEmail({ email: longEmail })
      expect(result.success).toBe(false)
      expect(result.errors![0].field).toBe('email')
    })
  })

  describe('Schema edge cases', () => {
    it('should handle name with valid special characters', async () => {
      const data = { ...validRSVPData, name: "Mary O'Connor-Smith" }
      const result = await validateRSVPForm(data)
      expect(result.success).toBe(true)
    })

    it('should reject name with invalid characters', async () => {
      const data = { ...validRSVPData, name: "John123 Doe" }
      const result = await validateRSVPForm(data)
      expect(result.success).toBe(false)
      expect(result.errors![0].field).toBe('name')
    })

    it('should handle attendance values correctly', async () => {
      const yesData = { ...validRSVPData, attendance: 'yes' as const }
      const noData = { ...validRSVPData, attendance: 'no' as const }

      const yesResult = await validateRSVPForm(yesData)
      const noResult = await validateRSVPForm(noData)

      expect(yesResult.success).toBe(true)
      expect(noResult.success).toBe(true)
    })

    it('should reject invalid attendance values', async () => {
      const data = { ...validRSVPData, attendance: 'maybe' as any }
      const result = await validateRSVPForm(data)
      expect(result.success).toBe(false)
      expect(result.errors![0].field).toBe('attendance')
    })

    it('should handle default guest count', async () => {
      const dataWithoutGuestCount = {
        name: 'John Doe',
        email: 'john@example.com',
        attendance: 'yes' as const,
      }

      try {
        const parsed = rsvpFormSchema.parse(dataWithoutGuestCount)
        expect(parsed.guestCount).toBe(0)
      } catch (error) {
        // This should not happen
        fail('Schema should provide default guest count')
      }
    })
  })

  describe('transformZodErrors', () => {
    it('should transform Zod errors correctly', () => {
      try {
        rsvpFormSchema.parse({
          name: '',
          email: 'invalid',
          attendance: 'maybe',
          guestCount: -1,
        })
      } catch (error) {
        if (error instanceof z.ZodError) {
          const transformed = transformZodErrors(error)

          expect(transformed).toBeInstanceOf(Array)
          expect(transformed.length).toBeGreaterThan(0)

          transformed.forEach(err => {
            expect(err).toHaveProperty('field')
            expect(err).toHaveProperty('message')
            expect(typeof err.field).toBe('string')
            expect(typeof err.message).toBe('string')
          })
        } else {
          fail('Expected ZodError')
        }
      }
    })
  })
})
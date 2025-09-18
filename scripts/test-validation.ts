#!/usr/bin/env tsx

import {
  validateRSVPForm,
  validateEmail,
  rsvpFormSchema,
  type RSVPFormData,
} from '../lib/validations'

async function runValidationTests() {
  console.log('🧪 Testing RSVP Form Validation System\n')

  // Test 1: Valid RSVP data
  console.log('Test 1: Valid RSVP data')
  const validData: RSVPFormData = {
    name: 'John Doe',
    email: 'john@example.com',
    attendance: 'yes',
    numberOfGuests: 2,
    guestNames: ['Jane Doe', 'Bob Smith'],
    dietaryRestrictions: 'Vegetarian',
    notes: 'Looking forward to celebrating!',
  }

  const validResult = await validateRSVPForm(validData)
  console.log('✅ Valid data test:', validResult.success ? 'PASSED' : 'FAILED')
  if (!validResult.success) {
    console.log('   Errors:', validResult.errors)
  }

  // Test 2: Invalid name (empty)
  console.log('\nTest 2: Invalid name (empty)')
  const invalidNameData = { ...validData, name: '' }
  const invalidNameResult = await validateRSVPForm(invalidNameData)
  console.log('✅ Empty name test:', !invalidNameResult.success ? 'PASSED' : 'FAILED')
  if (!invalidNameResult.success) {
    console.log('   Expected error:', invalidNameResult.errors?.[0]?.message)
  }

  // Test 3: Invalid email
  console.log('\nTest 3: Invalid email format')
  const invalidEmailData = { ...validData, email: 'not-an-email' }
  const invalidEmailResult = await validateRSVPForm(invalidEmailData)
  console.log('✅ Invalid email test:', !invalidEmailResult.success ? 'PASSED' : 'FAILED')
  if (!invalidEmailResult.success) {
    console.log('   Expected error:', invalidEmailResult.errors?.[0]?.message)
  }

  // Test 4: Missing attendance
  console.log('\nTest 4: Missing attendance')
  const missingAttendanceData = { ...validData }
  delete (missingAttendanceData as any).attendance
  const missingAttendanceResult = await validateRSVPForm(missingAttendanceData)
  console.log('✅ Missing attendance test:', !missingAttendanceResult.success ? 'PASSED' : 'FAILED')
  if (!missingAttendanceResult.success) {
    console.log('   Expected error:', missingAttendanceResult.errors?.[0]?.message)
  }

  // Test 5: Too many guests
  console.log('\nTest 5: Too many guests (> 10)')
  const tooManyGuestsData = { ...validData, numberOfGuests: 11, guestNames: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'] }
  const tooManyGuestsResult = await validateRSVPForm(tooManyGuestsData)
  console.log('✅ Too many guests test:', !tooManyGuestsResult.success ? 'PASSED' : 'FAILED')
  if (!tooManyGuestsResult.success) {
    console.log('   Expected error:', tooManyGuestsResult.errors?.[0]?.message)
  }

  // Test 6: Negative guest count
  console.log('\nTest 6: Negative guest count')
  const negativeGuestData = { ...validData, numberOfGuests: -1 }
  const negativeGuestResult = await validateRSVPForm(negativeGuestData)
  console.log('✅ Negative guest count test:', !negativeGuestResult.success ? 'PASSED' : 'FAILED')
  if (!negativeGuestResult.success) {
    console.log('   Expected error:', negativeGuestResult.errors?.[0]?.message)
  }

  // Test 7: Too long dietary restrictions
  console.log('\nTest 7: Too long dietary restrictions (> 500 chars)')
  const longDietaryData = { ...validData, dietaryRestrictions: 'x'.repeat(501) }
  const longDietaryResult = await validateRSVPForm(longDietaryData)
  console.log('✅ Long dietary restrictions test:', !longDietaryResult.success ? 'PASSED' : 'FAILED')
  if (!longDietaryResult.success) {
    console.log('   Expected error:', longDietaryResult.errors?.[0]?.message)
  }

  // Test 8: Too long notes
  console.log('\nTest 8: Too long notes (> 1000 chars)')
  const longNotesData = { ...validData, notes: 'x'.repeat(1001) }
  const longNotesResult = await validateRSVPForm(longNotesData)
  console.log('✅ Long notes test:', !longNotesResult.success ? 'PASSED' : 'FAILED')
  if (!longNotesResult.success) {
    console.log('   Expected error:', longNotesResult.errors?.[0]?.message)
  }

  // Test 9: Valid name with special characters
  console.log('\nTest 9: Valid name with special characters')
  const specialNameData = { ...validData, name: "Mary O'Connor-Smith" }
  const specialNameResult = await validateRSVPForm(specialNameData)
  console.log('✅ Special characters test:', specialNameResult.success ? 'PASSED' : 'FAILED')

  // Test 10: Invalid name with numbers
  console.log('\nTest 10: Invalid name with numbers')
  const invalidCharNameData = { ...validData, name: "John123 Doe" }
  const invalidCharNameResult = await validateRSVPForm(invalidCharNameData)
  console.log('✅ Invalid name characters test:', !invalidCharNameResult.success ? 'PASSED' : 'FAILED')
  if (!invalidCharNameResult.success) {
    console.log('   Expected error:', invalidCharNameResult.errors?.[0]?.message)
  }

  // Test 11: Minimal valid data (declining attendance)
  console.log('\nTest 11: Minimal valid data (declining)')
  const minimalData = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    attendance: 'no' as const,
    numberOfGuests: 0,
    guestNames: [],
  }
  const minimalResult = await validateRSVPForm(minimalData)
  console.log('✅ Minimal data test:', minimalResult.success ? 'PASSED' : 'FAILED')

  // Test 12: Email validation
  console.log('\nTest 12: Email validation')
  const emailTests = [
    { email: 'valid@example.com', shouldPass: true },
    { email: 'invalid-email', shouldPass: false },
    { email: '', shouldPass: false },
    { email: 'x'.repeat(250) + '@example.com', shouldPass: false },
  ]

  for (const test of emailTests) {
    const emailResult = await validateEmail({ email: test.email })
    const passed = emailResult.success === test.shouldPass
    console.log(`   ${test.email || '(empty)'}: ${passed ? 'PASSED' : 'FAILED'}`)
  }

  // Test 13: Default guest count behavior
  console.log('\nTest 13: Default guest count behavior')
  try {
    const dataWithoutGuestCount = {
      name: 'John Doe',
      email: 'john@example.com',
      attendance: 'yes' as const,
    }
    const parsed = rsvpFormSchema.parse(dataWithoutGuestCount)
    console.log('✅ Default guest count test:', parsed.numberOfGuests === 0 ? 'PASSED' : 'FAILED')
    console.log('   Default guest count:', parsed.numberOfGuests)
  } catch (error) {
    console.log('❌ Default guest count test: FAILED')
    console.log('   Error:', error)
  }

  console.log('\n🎉 Validation testing complete!')
}

// Run the tests
runValidationTests().catch(console.error)
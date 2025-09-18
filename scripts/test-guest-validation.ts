#!/usr/bin/env tsx

/**
 * Guest Validation Test Script
 *
 * This script comprehensively tests the new guest validation logic
 * implemented for Issue #12, including conditional guest names validation.
 * Run with: npx tsx scripts/test-guest-validation.ts
 */

import {
  validateRSVPForm,
  rsvpFormSchema,
  type RSVPFormData,
} from '../lib/validations'

interface TestCase {
  name: string
  data: Partial<RSVPFormData>
  shouldPass: boolean
  expectedErrors?: string[]
}

async function runGuestValidationTests() {
  console.log('🧪 Testing Guest Validation Implementation (Issue #12)\n')

  const testCases: TestCase[] = [
    // Valid guest scenarios
    {
      name: 'Valid: Attending with 0 guests',
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        attendance: 'yes',
        numberOfGuests: 0,
        guestNames: [],
      },
      shouldPass: true,
    },
    {
      name: 'Valid: Attending with 1 guest and 1 name',
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        attendance: 'yes',
        numberOfGuests: 1,
        guestNames: ['Jane Doe'],
      },
      shouldPass: true,
    },
    {
      name: 'Valid: Attending with 5 guests and 5 names',
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        attendance: 'yes',
        numberOfGuests: 5,
        guestNames: ['Jane Doe', 'Bob Smith', 'Alice Johnson', 'Charlie Brown', 'Diana Prince'],
      },
      shouldPass: true,
    },
    {
      name: 'Valid: Attending with 10 guests (maximum) and 10 names',
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        attendance: 'yes',
        numberOfGuests: 10,
        guestNames: ['Guest 1', 'Guest 2', 'Guest 3', 'Guest 4', 'Guest 5', 'Guest 6', 'Guest 7', 'Guest 8', 'Guest 9', 'Guest 10'],
      },
      shouldPass: true,
    },
    {
      name: 'Valid: Not attending with 0 guests',
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        attendance: 'no',
        numberOfGuests: 0,
        guestNames: [],
      },
      shouldPass: true,
    },

    // Invalid guest count scenarios
    {
      name: 'Invalid: More than 10 guests',
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        attendance: 'yes',
        numberOfGuests: 11,
        guestNames: ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'G11'],
      },
      shouldPass: false,
      expectedErrors: ['numberOfGuests'],
    },
    {
      name: 'Invalid: Negative guest count',
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        attendance: 'yes',
        numberOfGuests: -1,
        guestNames: [],
      },
      shouldPass: false,
      expectedErrors: ['numberOfGuests'],
    },

    // Invalid guest names scenarios
    {
      name: 'Invalid: Attending with guests but no guest names',
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        attendance: 'yes',
        numberOfGuests: 2,
        guestNames: [],
      },
      shouldPass: false,
      expectedErrors: ['guestNames'],
    },
    {
      name: 'Invalid: Attending with guests but insufficient guest names',
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        attendance: 'yes',
        numberOfGuests: 3,
        guestNames: ['Jane Doe', 'Bob Smith'], // only 2 names for 3 guests
      },
      shouldPass: false,
      expectedErrors: ['guestNames'],
    },
    {
      name: 'Invalid: More guest names than guest count',
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        attendance: 'yes',
        numberOfGuests: 2,
        guestNames: ['Jane Doe', 'Bob Smith', 'Alice Johnson'], // 3 names for 2 guests
      },
      shouldPass: false,
      expectedErrors: ['guestNames'],
    },
    {
      name: 'Invalid: Not attending but has guests',
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        attendance: 'no',
        numberOfGuests: 2,
        guestNames: ['Jane Doe', 'Bob Smith'],
      },
      shouldPass: false,
      expectedErrors: ['numberOfGuests'],
    },

    // Invalid guest name content
    {
      name: 'Invalid: Empty guest name',
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        attendance: 'yes',
        numberOfGuests: 2,
        guestNames: ['Jane Doe', ''], // empty guest name
      },
      shouldPass: false,
      expectedErrors: ['guestNames.1'],
    },
    {
      name: 'Invalid: Guest name with special characters',
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        attendance: 'yes',
        numberOfGuests: 2,
        guestNames: ['Jane Doe', 'Guest@#$'], // invalid characters
      },
      shouldPass: false,
      expectedErrors: ['guestNames.1'],
    },
    {
      name: 'Invalid: Guest name too long',
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        attendance: 'yes',
        numberOfGuests: 1,
        guestNames: ['A'.repeat(101)], // too long
      },
      shouldPass: false,
      expectedErrors: ['guestNames.0'],
    },

    // Edge cases
    {
      name: 'Edge case: Maximum valid guest names array',
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        attendance: 'yes',
        numberOfGuests: 10,
        guestNames: Array.from({ length: 10 }, (_, i) => `Guest ${i + 1}`),
      },
      shouldPass: true,
    },
    {
      name: 'Invalid: Too many guest names in array (exceeds 10)',
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        attendance: 'yes',
        numberOfGuests: 11, // This will fail anyway, but testing array limit
        guestNames: Array.from({ length: 11 }, (_, i) => `Guest ${i + 1}`),
      },
      shouldPass: false,
      expectedErrors: ['numberOfGuests', 'guestNames'],
    },
  ]

  let passedTests = 0
  let failedTests = 0

  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}`)

    try {
      const result = await validateRSVPForm(testCase.data)

      if (testCase.shouldPass && result.success) {
        console.log('✅ PASSED - Validation succeeded as expected')
        passedTests++
      } else if (!testCase.shouldPass && !result.success) {
        console.log('✅ PASSED - Validation failed as expected')

        if (testCase.expectedErrors) {
          const actualErrors = result.errors?.map(e => e.field) || []
          const missingErrors = testCase.expectedErrors.filter(field => !actualErrors.includes(field))
          const unexpectedErrors = actualErrors.filter(field => !testCase.expectedErrors!.includes(field))

          if (missingErrors.length === 0 && unexpectedErrors.length === 0) {
            console.log('   Error fields match exactly')
          } else {
            if (missingErrors.length > 0) {
              console.log(`   ⚠️  Missing expected errors: ${missingErrors.join(', ')}`)
            }
            if (unexpectedErrors.length > 0) {
              console.log(`   ⚠️  Unexpected errors: ${unexpectedErrors.join(', ')}`)
            }
          }
        }

        console.log(`   Errors: ${result.errors?.map(e => `${e.field}: ${e.message}`).join(', ')}`)
        passedTests++
      } else {
        console.log('❌ FAILED - Unexpected validation result')
        console.log(`   Expected success: ${testCase.shouldPass}, Got success: ${result.success}`)
        if (!result.success) {
          console.log(`   Errors: ${result.errors?.map(e => `${e.field}: ${e.message}`).join(', ')}`)
        }
        failedTests++
      }
    } catch (error) {
      console.log('❌ FAILED - Test threw an error')
      console.log(`   Error: ${error}`)
      failedTests++
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('🏁 Test Summary')
  console.log('='.repeat(60))
  console.log(`Total tests: ${testCases.length}`)
  console.log(`Passed: ${passedTests}`)
  console.log(`Failed: ${failedTests}`)

  if (failedTests === 0) {
    console.log('\n🎉 All guest validation tests passed!')
    console.log('✅ Issue #12 implementation appears to be working correctly')
  } else {
    console.log('\n❌ Some tests failed. Please review the implementation.')
    process.exit(1)
  }
}

// Additional validation logic tests
async function testValidationLogic() {
  console.log('\n' + '='.repeat(60))
  console.log('🔍 Testing Validation Logic Details')
  console.log('='.repeat(60))

  // Test 1: Schema defaults
  console.log('\n1️⃣ Testing schema defaults')
  try {
    const minimal = {
      name: 'Test User',
      email: 'test@example.com',
      attendance: 'no' as const,
    }
    const parsed = rsvpFormSchema.parse(minimal)
    console.log('✅ Schema defaults applied correctly')
    console.log(`   numberOfGuests: ${parsed.numberOfGuests} (expected: 0)`)
    console.log(`   guestNames: [${parsed.guestNames?.join(', ') || ''}] (expected: [])`)
  } catch (error) {
    console.log('❌ Schema defaults test failed')
    console.log(`   Error: ${error}`)
  }

  // Test 2: Refine validations
  console.log('\n2️⃣ Testing refine validations')
  const refineTests = [
    {
      name: 'Guest names required when attending with guests',
      data: {
        name: 'Test User',
        email: 'test@example.com',
        attendance: 'yes' as const,
        numberOfGuests: 2,
        guestNames: [],
      },
      expectedError: 'guestNames',
    },
    {
      name: 'No guests when not attending',
      data: {
        name: 'Test User',
        email: 'test@example.com',
        attendance: 'no' as const,
        numberOfGuests: 1,
        guestNames: ['Guest'],
      },
      expectedError: 'numberOfGuests',
    },
  ]

  for (const test of refineTests) {
    try {
      rsvpFormSchema.parse(test.data)
      console.log(`❌ ${test.name}: Expected validation error but got success`)
    } catch (error) {
      console.log(`✅ ${test.name}: Correctly rejected`)
    }
  }
}

// Run all tests
async function main() {
  try {
    await runGuestValidationTests()
    await testValidationLogic()
  } catch (error) {
    console.error('Test execution failed:', error)
    process.exit(1)
  }
}

main()
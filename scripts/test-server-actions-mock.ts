#!/usr/bin/env tsx

/**
 * Mock test script for Server Actions with guest names functionality
 * Tests validation logic without requiring database connectivity
 */

import { validateCompleteRSVP, transformZodErrors } from '../lib/validations'

function extractGuestNamesFromFormData(formData: FormData): string[] {
  const guestNames: string[] = []

  // Check for guest names in multiple possible formats
  // Format 1: Individual guest fields (guestName0, guestName1, etc.)
  let index = 0
  while (formData.has(`guestName${index}`)) {
    const guestName = formData.get(`guestName${index}`)?.toString().trim()
    if (guestName) {
      guestNames.push(guestName)
    }
    index++
  }

  // Format 2: Array-style fields (guestNames[0], guestNames[1], etc.)
  if (guestNames.length === 0) {
    index = 0
    while (formData.has(`guestNames[${index}]`)) {
      const guestName = formData.get(`guestNames[${index}]`)?.toString().trim()
      if (guestName) {
        guestNames.push(guestName)
      }
      index++
    }
  }

  // Format 3: JSON string in single field
  if (guestNames.length === 0) {
    const guestNamesJson = formData.get("guestNames")?.toString()
    if (guestNamesJson) {
      try {
        const parsed = JSON.parse(guestNamesJson)
        if (Array.isArray(parsed)) {
          guestNames.push(...parsed.filter(name => typeof name === 'string' && name.trim().length > 0))
        }
      } catch (error) {
        // Invalid JSON, ignore
      }
    }
  }

  return guestNames
}

function processFormData(formData: FormData) {
  const guestNames = extractGuestNamesFromFormData(formData)

  return {
    name: formData.get("name"),
    email: formData.get("email"),
    attendance: formData.get("attendance"),
    numberOfGuests: formData.get("numberOfGuests") ? Number(formData.get("numberOfGuests")) :
                   formData.get("guestCount") ? Number(formData.get("guestCount")) : 0,
    guestNames: guestNames.length > 0 ? guestNames : undefined,
    dietaryRestrictions: formData.get("dietaryRestrictions") || undefined,
    notes: formData.get("notes") || undefined,
  }
}

async function testServerActionsValidation() {
  console.log('🧪 Testing Server Actions Validation Logic (Mock)\n')

  let passedTests = 0
  let totalTests = 0

  function runTest(name: string, testFn: () => Promise<boolean>): Promise<void> {
    totalTests++
    return testFn().then(passed => {
      if (passed) {
        passedTests++
        console.log(`✅ ${name}: PASSED`)
      } else {
        console.log(`❌ ${name}: FAILED`)
      }
    }).catch(error => {
      console.log(`❌ ${name}: ERROR - ${error.message}`)
    })
  }

  // Test 1: Valid RSVP with guest names (FormData)
  await runTest('Valid RSVP with guest names (FormData)', async () => {
    const formData = new FormData()
    formData.append('name', 'John Doe')
    formData.append('email', 'john.doe@example.com')
    formData.append('attendance', 'yes')
    formData.append('numberOfGuests', '2')
    formData.append('guestName0', 'Jane Smith')
    formData.append('guestName1', 'Bob Johnson')
    formData.append('notes', 'Looking forward to the wedding!')

    const rawData = processFormData(formData)
    const result = await validateCompleteRSVP(rawData)

    console.log('   Data processed:', JSON.stringify(rawData, null, 2))
    if (!result.success) {
      console.log('   Validation errors:', result.errors)
    }

    return result.success
  })

  // Test 2: Valid RSVP with guest names (JSON format)
  await runTest('Valid RSVP with guest names (JSON format)', async () => {
    const jsonData = {
      name: 'Alice Cooper',
      email: 'alice.cooper@example.com',
      attendance: 'yes' as const,
      numberOfGuests: 3,
      guestNames: ['Charlie Brown', 'Diana Prince', 'Edward King'],
      notes: 'Excited to celebrate with you!'
    }

    const result = await validateCompleteRSVP(jsonData)

    if (!result.success) {
      console.log('   Validation errors:', result.errors)
    }

    return result.success
  })

  // Test 3: Not attending (should have 0 guests)
  await runTest('Not attending (should have 0 guests)', async () => {
    const formData = new FormData()
    formData.append('name', 'Sarah Wilson')
    formData.append('email', 'sarah.wilson@example.com')
    formData.append('attendance', 'no')
    formData.append('numberOfGuests', '0')
    formData.append('notes', 'Sorry, cannot make it')

    const rawData = processFormData(formData)
    const result = await validateCompleteRSVP(rawData)

    if (!result.success) {
      console.log('   Validation errors:', result.errors)
    }

    return result.success
  })

  // Test 4: Invalid - attending with guests but no guest names
  await runTest('Invalid - attending with guests but no guest names', async () => {
    const jsonData = {
      name: 'Mike Davis',
      email: 'mike.davis@example.com',
      attendance: 'yes' as const,
      numberOfGuests: 2,
      guestNames: [], // Empty array when guests expected
      notes: 'This should fail validation'
    }

    const result = await validateCompleteRSVP(jsonData)

    if (result.success) {
      console.log('   Unexpected success - validation should have failed')
    } else {
      console.log('   Expected validation errors:', result.errors?.map(e => e.message))
    }

    return !result.success // Should fail validation
  })

  // Test 5: Invalid - guest count mismatch
  await runTest('Invalid - guest count mismatch', async () => {
    const formData = new FormData()
    formData.append('name', 'Lisa Jones')
    formData.append('email', 'lisa.jones@example.com')
    formData.append('attendance', 'yes')
    formData.append('numberOfGuests', '3')
    formData.append('guestName0', 'Guest One')
    formData.append('guestName1', 'Guest Two')
    // Only 2 guest names for 3 guests - should fail

    const rawData = processFormData(formData)
    const result = await validateCompleteRSVP(rawData)

    if (result.success) {
      console.log('   Unexpected success - validation should have failed')
    } else {
      console.log('   Expected validation errors:', result.errors?.map(e => e.message))
    }

    return !result.success // Should fail validation
  })

  // Test 6: Invalid - too many guests
  await runTest('Invalid - too many guests', async () => {
    const guestNames = Array.from({ length: 12 }, (_, i) => `Guest ${i + 1}`)

    const jsonData = {
      name: 'Big Family',
      email: 'big.family@example.com',
      attendance: 'yes' as const,
      numberOfGuests: 12,
      guestNames,
      notes: 'Too many guests'
    }

    const result = await validateCompleteRSVP(jsonData)

    if (result.success) {
      console.log('   Unexpected success - validation should have failed')
    } else {
      console.log('   Expected validation errors:', result.errors?.map(e => e.message))
    }

    return !result.success // Should fail validation
  })

  // Test 7: Invalid - empty guest name
  await runTest('Invalid - empty guest name', async () => {
    const formData = new FormData()
    formData.append('name', 'Tom Smith')
    formData.append('email', 'tom.smith@example.com')
    formData.append('attendance', 'yes')
    formData.append('numberOfGuests', '2')
    formData.append('guestName0', 'Valid Guest')
    formData.append('guestName1', '') // Empty guest name - should fail

    const rawData = processFormData(formData)
    const result = await validateCompleteRSVP(rawData)

    if (result.success) {
      console.log('   Unexpected success - validation should have failed')
    } else {
      console.log('   Expected validation errors:', result.errors?.map(e => e.message))
    }

    return !result.success // Should fail validation
  })

  // Test 8: Invalid - invalid guest name characters
  await runTest('Invalid - invalid guest name characters', async () => {
    const jsonData = {
      name: 'Test User',
      email: 'test.user@example.com',
      attendance: 'yes' as const,
      numberOfGuests: 1,
      guestNames: ['Guest@#$%'], // Invalid characters
      notes: 'Invalid guest name characters'
    }

    const result = await validateCompleteRSVP(jsonData)

    if (result.success) {
      console.log('   Unexpected success - validation should have failed')
    } else {
      console.log('   Expected validation errors:', result.errors?.map(e => e.message))
    }

    return !result.success // Should fail validation
  })

  // Test 9: Edge case - attending with 0 guests
  await runTest('Edge case - attending with 0 guests', async () => {
    const jsonData = {
      name: 'Solo Attendee',
      email: 'solo.attendee@example.com',
      attendance: 'yes' as const,
      numberOfGuests: 0,
      guestNames: [],
      notes: 'Coming alone'
    }

    const result = await validateCompleteRSVP(jsonData)

    if (!result.success) {
      console.log('   Validation errors:', result.errors)
    }

    return result.success
  })

  // Test 10: Different FormData formats (array style)
  await runTest('Different FormData formats (array style)', async () => {
    const formData = new FormData()
    formData.append('name', 'Array User')
    formData.append('email', 'array.user@example.com')
    formData.append('attendance', 'yes')
    formData.append('numberOfGuests', '2')
    formData.append('guestNames[0]', 'Array Guest 1')
    formData.append('guestNames[1]', 'Array Guest 2')

    const rawData = processFormData(formData)
    const result = await validateCompleteRSVP(rawData)

    console.log('   Data processed:', JSON.stringify(rawData, null, 2))
    if (!result.success) {
      console.log('   Validation errors:', result.errors)
    }

    return result.success
  })

  // Test 11: JSON string in FormData
  await runTest('JSON string in FormData', async () => {
    const formData = new FormData()
    formData.append('name', 'JSON User')
    formData.append('email', 'json.user@example.com')
    formData.append('attendance', 'yes')
    formData.append('numberOfGuests', '2')
    formData.append('guestNames', JSON.stringify(['JSON Guest 1', 'JSON Guest 2']))

    const rawData = processFormData(formData)
    const result = await validateCompleteRSVP(rawData)

    console.log('   Data processed:', JSON.stringify(rawData, null, 2))
    if (!result.success) {
      console.log('   Validation errors:', result.errors)
    }

    return result.success
  })

  // Test 12: Invalid - not attending with guests
  await runTest('Invalid - not attending with guests', async () => {
    const jsonData = {
      name: 'Invalid User',
      email: 'invalid.user@example.com',
      attendance: 'no' as const,
      numberOfGuests: 2, // Should be 0 when not attending
      guestNames: ['Should', 'Not be here'],
      notes: 'This should fail validation'
    }

    const result = await validateCompleteRSVP(jsonData)

    if (result.success) {
      console.log('   Unexpected success - validation should have failed')
    } else {
      console.log('   Expected validation errors:', result.errors?.map(e => e.message))
    }

    return !result.success // Should fail validation
  })

  console.log('\n🎉 Server Actions validation testing complete!')
  console.log(`\n📊 Summary: ${passedTests}/${totalTests} tests passed`)

  if (passedTests === totalTests) {
    console.log('✅ All tests passed! Server Actions validation logic is working correctly.')
  } else {
    console.log('❌ Some tests failed. Please review the validation logic.')
  }
}

// Run the tests
testServerActionsValidation().catch(console.error)
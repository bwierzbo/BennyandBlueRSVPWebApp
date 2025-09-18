#!/usr/bin/env tsx

/**
 * Test script for Server Actions with guest names functionality
 * Tests all scenarios for RSVP submission including guest names validation
 */

import { submitRSVP, submitRSVPJSON } from '../lib/actions'
import { db } from '../lib/db'

async function testServerActions() {
  console.log('🚀 Testing Server Actions with Guest Names\n')

  // Initialize database first
  try {
    await db.initializeTables()
    console.log('✅ Database initialized\n')
  } catch (error) {
    console.log('❌ Database initialization failed:', error)
    return
  }

  // Test 1: Valid RSVP with guest names (FormData)
  console.log('Test 1: Valid RSVP with guest names (FormData)')
  try {
    const formData = new FormData()
    formData.append('name', 'John Doe')
    formData.append('email', 'john.doe.test1@example.com')
    formData.append('attendance', 'yes')
    formData.append('numberOfGuests', '2')
    formData.append('guestName0', 'Jane Smith')
    formData.append('guestName1', 'Bob Johnson')
    formData.append('notes', 'Looking forward to the wedding!')

    const result = await submitRSVP(formData)

    console.log('✅ Valid RSVP with guests test:', result.success ? 'PASSED' : 'FAILED')
    console.log('   Result:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.log('❌ Valid RSVP with guests test: FAILED')
    console.log('   Error:', error)
  }

  // Test 2: Valid RSVP with guest names (JSON format)
  console.log('\nTest 2: Valid RSVP with guest names (JSON format)')
  try {
    const jsonData = {
      name: 'Alice Cooper',
      email: 'alice.cooper.test2@example.com',
      attendance: 'yes' as const,
      numberOfGuests: 3,
      guestNames: ['Charlie Brown', 'Diana Prince', 'Edward King'],
      notes: 'Excited to celebrate with you!'
    }

    const result = await submitRSVPJSON(jsonData)

    console.log('✅ Valid RSVP JSON with guests test:', result.success ? 'PASSED' : 'FAILED')
    console.log('   Result:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.log('❌ Valid RSVP JSON with guests test: FAILED')
    console.log('   Error:', error)
  }

  // Test 3: Not attending (should have 0 guests)
  console.log('\nTest 3: Not attending (should have 0 guests)')
  try {
    const formData = new FormData()
    formData.append('name', 'Sarah Wilson')
    formData.append('email', 'sarah.wilson.test3@example.com')
    formData.append('attendance', 'no')
    formData.append('numberOfGuests', '0')
    formData.append('notes', 'Sorry, cannot make it')

    const result = await submitRSVP(formData)

    console.log('✅ Not attending test:', result.success ? 'PASSED' : 'FAILED')
    console.log('   Result:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.log('❌ Not attending test: FAILED')
    console.log('   Error:', error)
  }

  // Test 4: Invalid - attending with guests but no guest names
  console.log('\nTest 4: Invalid - attending with guests but no guest names')
  try {
    const jsonData = {
      name: 'Mike Davis',
      email: 'mike.davis.test4@example.com',
      attendance: 'yes' as const,
      numberOfGuests: 2,
      guestNames: [], // Empty array when guests expected
      notes: 'This should fail validation'
    }

    const result = await submitRSVPJSON(jsonData)

    console.log('✅ Invalid guest names test:', !result.success ? 'PASSED' : 'FAILED')
    console.log('   Result:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.log('❌ Invalid guest names test: FAILED')
    console.log('   Error:', error)
  }

  // Test 5: Invalid - guest count mismatch
  console.log('\nTest 5: Invalid - guest count mismatch')
  try {
    const formData = new FormData()
    formData.append('name', 'Lisa Jones')
    formData.append('email', 'lisa.jones.test5@example.com')
    formData.append('attendance', 'yes')
    formData.append('numberOfGuests', '3')
    formData.append('guestName0', 'Guest One')
    formData.append('guestName1', 'Guest Two')
    // Only 2 guest names for 3 guests - should fail

    const result = await submitRSVP(formData)

    console.log('✅ Guest count mismatch test:', !result.success ? 'PASSED' : 'FAILED')
    console.log('   Result:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.log('❌ Guest count mismatch test: FAILED')
    console.log('   Error:', error)
  }

  // Test 6: Invalid - too many guests
  console.log('\nTest 6: Invalid - too many guests')
  try {
    const guestNames = Array.from({ length: 12 }, (_, i) => `Guest ${i + 1}`)

    const jsonData = {
      name: 'Big Family',
      email: 'big.family.test6@example.com',
      attendance: 'yes' as const,
      numberOfGuests: 12,
      guestNames,
      notes: 'Too many guests'
    }

    const result = await submitRSVPJSON(jsonData)

    console.log('✅ Too many guests test:', !result.success ? 'PASSED' : 'FAILED')
    console.log('   Result:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.log('❌ Too many guests test: FAILED')
    console.log('   Error:', error)
  }

  // Test 7: Invalid - empty guest name
  console.log('\nTest 7: Invalid - empty guest name')
  try {
    const formData = new FormData()
    formData.append('name', 'Tom Smith')
    formData.append('email', 'tom.smith.test7@example.com')
    formData.append('attendance', 'yes')
    formData.append('numberOfGuests', '2')
    formData.append('guestName0', 'Valid Guest')
    formData.append('guestName1', '') // Empty guest name - should fail

    const result = await submitRSVP(formData)

    console.log('✅ Empty guest name test:', !result.success ? 'PASSED' : 'FAILED')
    console.log('   Result:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.log('❌ Empty guest name test: FAILED')
    console.log('   Error:', error)
  }

  // Test 8: Invalid - invalid guest name characters
  console.log('\nTest 8: Invalid - invalid guest name characters')
  try {
    const jsonData = {
      name: 'Test User',
      email: 'test.user.test8@example.com',
      attendance: 'yes' as const,
      numberOfGuests: 1,
      guestNames: ['Guest@#$%'], // Invalid characters
      notes: 'Invalid guest name characters'
    }

    const result = await submitRSVPJSON(jsonData)

    console.log('✅ Invalid guest name characters test:', !result.success ? 'PASSED' : 'FAILED')
    console.log('   Result:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.log('❌ Invalid guest name characters test: FAILED')
    console.log('   Error:', error)
  }

  // Test 9: Edge case - attending with 0 guests
  console.log('\nTest 9: Edge case - attending with 0 guests')
  try {
    const jsonData = {
      name: 'Solo Attendee',
      email: 'solo.attendee.test9@example.com',
      attendance: 'yes' as const,
      numberOfGuests: 0,
      guestNames: [],
      notes: 'Coming alone'
    }

    const result = await submitRSVPJSON(jsonData)

    console.log('✅ Solo attendee test:', result.success ? 'PASSED' : 'FAILED')
    console.log('   Result:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.log('❌ Solo attendee test: FAILED')
    console.log('   Error:', error)
  }

  // Test 10: Different FormData formats (array style)
  console.log('\nTest 10: Different FormData formats (array style)')
  try {
    const formData = new FormData()
    formData.append('name', 'Array User')
    formData.append('email', 'array.user.test10@example.com')
    formData.append('attendance', 'yes')
    formData.append('numberOfGuests', '2')
    formData.append('guestNames[0]', 'Array Guest 1')
    formData.append('guestNames[1]', 'Array Guest 2')

    const result = await submitRSVP(formData)

    console.log('✅ Array FormData format test:', result.success ? 'PASSED' : 'FAILED')
    console.log('   Result:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.log('❌ Array FormData format test: FAILED')
    console.log('   Error:', error)
  }

  // Test 11: JSON string in FormData
  console.log('\nTest 11: JSON string in FormData')
  try {
    const formData = new FormData()
    formData.append('name', 'JSON User')
    formData.append('email', 'json.user.test11@example.com')
    formData.append('attendance', 'yes')
    formData.append('numberOfGuests', '2')
    formData.append('guestNames', JSON.stringify(['JSON Guest 1', 'JSON Guest 2']))

    const result = await submitRSVP(formData)

    console.log('✅ JSON FormData format test:', result.success ? 'PASSED' : 'FAILED')
    console.log('   Result:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.log('❌ JSON FormData format test: FAILED')
    console.log('   Error:', error)
  }

  // Test 12: Duplicate email test
  console.log('\nTest 12: Duplicate email test')
  try {
    const jsonData = {
      name: 'Duplicate User',
      email: 'john.doe.test1@example.com', // Same email as Test 1
      attendance: 'yes' as const,
      numberOfGuests: 1,
      guestNames: ['Duplicate Guest'],
      notes: 'This should fail due to duplicate email'
    }

    const result = await submitRSVPJSON(jsonData)

    console.log('✅ Duplicate email test:', !result.success ? 'PASSED' : 'FAILED')
    console.log('   Result:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.log('❌ Duplicate email test: FAILED')
    console.log('   Error:', error)
  }

  console.log('\n🎉 Server Actions testing complete!')
  console.log('\n📊 Summary:')
  console.log('   - 12 tests covering various guest name scenarios')
  console.log('   - FormData and JSON input validation')
  console.log('   - Edge cases and error handling')
  console.log('   - Database integration and constraint validation')
}

// Run the tests
testServerActions().catch(console.error)
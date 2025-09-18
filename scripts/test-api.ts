#!/usr/bin/env tsx

async function testAPIEndpoints() {
  console.log('🌐 Testing API Endpoints\n')

  const baseURL = 'http://localhost:3002'

  // Test 1: Valid RSVP submission
  console.log('Test 1: Valid RSVP submission')
  try {
    const validData = {
      name: 'API Test User',
      email: 'api-test@example.com',
      attendance: 'yes',
      guestCount: 1,
      dietaryRestrictions: 'None',
      notes: 'Testing API',
    }

    const response = await fetch(`${baseURL}/api/rsvp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validData),
    })

    const result = await response.json()
    console.log('✅ Valid RSVP test:', response.ok ? 'PASSED' : 'FAILED')
    console.log('   Response:', result)
  } catch (error) {
    console.log('❌ Valid RSVP test: FAILED')
    console.log('   Error:', error)
  }

  // Test 2: Invalid RSVP submission (empty name)
  console.log('\nTest 2: Invalid RSVP submission (empty name)')
  try {
    const invalidData = {
      name: '',
      email: 'api-test2@example.com',
      attendance: 'yes',
      guestCount: 0,
    }

    const response = await fetch(`${baseURL}/api/rsvp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData),
    })

    const result = await response.json()
    console.log('✅ Invalid RSVP test:', !response.ok ? 'PASSED' : 'FAILED')
    console.log('   Response:', result)
  } catch (error) {
    console.log('❌ Invalid RSVP test: FAILED')
    console.log('   Error:', error)
  }

  // Test 3: Email validation endpoint
  console.log('\nTest 3: Email validation endpoint')
  try {
    const emailData = {
      email: 'new-user@example.com'
    }

    const response = await fetch(`${baseURL}/api/validate-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    const result = await response.json()
    console.log('✅ Email validation test:', response.ok ? 'PASSED' : 'FAILED')
    console.log('   Response:', result)
  } catch (error) {
    console.log('❌ Email validation test: FAILED')
    console.log('   Error:', error)
  }

  // Test 4: Invalid email validation
  console.log('\nTest 4: Invalid email validation')
  try {
    const invalidEmailData = {
      email: 'invalid-email'
    }

    const response = await fetch(`${baseURL}/api/validate-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidEmailData),
    })

    const result = await response.json()
    console.log('✅ Invalid email validation test:', !response.ok ? 'PASSED' : 'FAILED')
    console.log('   Response:', result)
  } catch (error) {
    console.log('❌ Invalid email validation test: FAILED')
    console.log('   Error:', error)
  }

  // Test 5: Duplicate email (simulated)
  console.log('\nTest 5: Duplicate email test')
  try {
    const duplicateEmailData = {
      email: 'test@example.com' // This should be in our simulated "existing" list
    }

    const response = await fetch(`${baseURL}/api/validate-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(duplicateEmailData),
    })

    const result = await response.json()
    console.log('✅ Duplicate email test:', !response.ok ? 'PASSED' : 'FAILED')
    console.log('   Response:', result)
  } catch (error) {
    console.log('❌ Duplicate email test: FAILED')
    console.log('   Error:', error)
  }

  console.log('\n🎉 API testing complete!')
}

// Run the tests (only if server is running)
testAPIEndpoints().catch(console.error)
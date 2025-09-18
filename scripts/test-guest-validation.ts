#!/usr/bin/env tsx

/**
 * Guest Names Validation and Error Handling Test Script
 *
 * This script tests the enhanced validation and error handling for guest names
 * in the database utilities, including edge cases and error conditions.
 * Run with: npx tsx scripts/test-guest-validation.ts
 */

import { guestValidation, formatConverters } from '../lib/db';
import type { RSVPCreateData, RSVPUpdateData } from '../types';

function assertValidationResult(
  result: { isValid: boolean; error?: string },
  expected: { isValid: boolean; error?: string },
  testName: string
): void {
  if (result.isValid !== expected.isValid) {
    console.error(`❌ ${testName} FAILED:`);
    console.error(`Expected isValid: ${expected.isValid}, got: ${result.isValid}`);
    throw new Error(`Test failed: ${testName}`);
  }

  if (expected.error && !result.error?.includes(expected.error)) {
    console.error(`❌ ${testName} FAILED:`);
    console.error(`Expected error to contain: "${expected.error}", got: "${result.error}"`);
    throw new Error(`Test failed: ${testName}`);
  }

  console.log(`✅ ${testName} PASSED`);
}

function assertThrows(fn: () => any, expectedError: string, testName: string): void {
  try {
    fn();
    console.error(`❌ ${testName} FAILED: Expected error but none was thrown`);
    throw new Error(`Test failed: ${testName}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes(expectedError)) {
      console.log(`✅ ${testName} PASSED`);
    } else {
      console.error(`❌ ${testName} FAILED:`);
      console.error(`Expected error containing: "${expectedError}", got: "${error}"`);
      throw new Error(`Test failed: ${testName}`);
    }
  }
}

async function testGuestValidation() {
  console.log('🧪 Starting Guest Names Validation Tests...\n');

  let testCount = 0;
  let passedTests = 0;

  try {
    // Test 1: Valid guest names array
    testCount++;
    console.log('1️⃣ Testing valid guest names array...');
    const validResult = guestValidation.validateGuestNames(['John Doe', 'Jane Smith']);
    assertValidationResult(validResult, { isValid: true }, 'Valid guest names array');
    passedTests++;

    // Test 2: Undefined guest names (should be valid)
    testCount++;
    console.log('\n2️⃣ Testing undefined guest names...');
    const undefinedResult = guestValidation.validateGuestNames(undefined);
    assertValidationResult(undefinedResult, { isValid: true }, 'Undefined guest names');
    passedTests++;

    // Test 3: Empty array (should be valid)
    testCount++;
    console.log('\n3️⃣ Testing empty guest names array...');
    const emptyResult = guestValidation.validateGuestNames([]);
    assertValidationResult(emptyResult, { isValid: true }, 'Empty guest names array');
    passedTests++;

    // Test 4: Too many guests (more than 10)
    testCount++;
    console.log('\n4️⃣ Testing too many guest names...');
    const tooManyGuests = Array.from({ length: 11 }, (_, i) => `Guest ${i + 1}`);
    const tooManyResult = guestValidation.validateGuestNames(tooManyGuests);
    assertValidationResult(tooManyResult, { isValid: false, error: 'Maximum 10 guest names allowed' }, 'Too many guest names');
    passedTests++;

    // Test 5: Non-array input
    testCount++;
    console.log('\n5️⃣ Testing non-array guest names...');
    const nonArrayResult = guestValidation.validateGuestNames('not an array' as any);
    assertValidationResult(nonArrayResult, { isValid: false, error: 'Guest names must be an array' }, 'Non-array guest names');
    passedTests++;

    // Test 6: Non-string guest name
    testCount++;
    console.log('\n6️⃣ Testing non-string guest name...');
    const nonStringResult = guestValidation.validateGuestNames(['John Doe', 123] as any);
    assertValidationResult(nonStringResult, { isValid: false, error: 'must be a string' }, 'Non-string guest name');
    passedTests++;

    // Test 7: Empty string guest name
    testCount++;
    console.log('\n7️⃣ Testing empty string guest name...');
    const emptyStringResult = guestValidation.validateGuestNames(['John Doe', '   ']);
    assertValidationResult(emptyStringResult, { isValid: false, error: 'cannot be empty' }, 'Empty string guest name');
    passedTests++;

    // Test 8: Too long guest name
    testCount++;
    console.log('\n8️⃣ Testing too long guest name...');
    const longName = 'A'.repeat(101);
    const tooLongResult = guestValidation.validateGuestNames(['John Doe', longName]);
    assertValidationResult(tooLongResult, { isValid: false, error: 'cannot exceed 100 characters' }, 'Too long guest name');
    passedTests++;

    // Test 9: Valid guest count consistency
    testCount++;
    console.log('\n9️⃣ Testing valid guest count consistency...');
    const validCountResult = guestValidation.validateGuestCount(2, ['John Doe', 'Jane Smith']);
    assertValidationResult(validCountResult, { isValid: true }, 'Valid guest count consistency');
    passedTests++;

    // Test 10: Invalid guest count consistency
    testCount++;
    console.log('\n🔟 Testing invalid guest count consistency...');
    const invalidCountResult = guestValidation.validateGuestCount(3, ['John Doe', 'Jane Smith']);
    assertValidationResult(invalidCountResult, { isValid: false, error: 'must match guest names count' }, 'Invalid guest count consistency');
    passedTests++;

    // Test 11: Guest count with no guest names (should be valid)
    testCount++;
    console.log('\n1️⃣1️⃣ Testing guest count with no guest names...');
    const noGuestNamesResult = guestValidation.validateGuestCount(5, undefined);
    assertValidationResult(noGuestNamesResult, { isValid: true }, 'Guest count with no guest names');
    passedTests++;

    // Test 12: Safe serialization of valid guest names
    testCount++;
    console.log('\n1️⃣2️⃣ Testing safe guest names serialization...');
    const serialized = guestValidation.safeSerializeGuestNames(['John Doe', 'Jane Smith']);
    const expected = JSON.stringify(['John Doe', 'Jane Smith']);
    if (serialized !== expected) {
      throw new Error(`Serialization mismatch: expected ${expected}, got ${serialized}`);
    }
    console.log('✅ Safe guest names serialization PASSED');
    passedTests++;

    // Test 13: Safe serialization of undefined
    testCount++;
    console.log('\n1️⃣3️⃣ Testing safe serialization of undefined...');
    const serializedUndefined = guestValidation.safeSerializeGuestNames(undefined);
    if (serializedUndefined !== null) {
      throw new Error(`Expected null, got ${serializedUndefined}`);
    }
    console.log('✅ Safe serialization of undefined PASSED');
    passedTests++;

    // Test 14: Safe serialization of empty array
    testCount++;
    console.log('\n1️⃣4️⃣ Testing safe serialization of empty array...');
    const serializedEmpty = guestValidation.safeSerializeGuestNames([]);
    if (serializedEmpty !== null) {
      throw new Error(`Expected null, got ${serializedEmpty}`);
    }
    console.log('✅ Safe serialization of empty array PASSED');
    passedTests++;

    // Test 15: Safe parsing of valid JSON
    testCount++;
    console.log('\n1️⃣5️⃣ Testing safe parsing of valid JSON...');
    const jsonString = JSON.stringify(['John Doe', 'Jane Smith']);
    const parsed = guestValidation.safeParseGuestNames(jsonString);
    if (JSON.stringify(parsed) !== jsonString) {
      throw new Error(`Parsing mismatch: expected ${jsonString}, got ${JSON.stringify(parsed)}`);
    }
    console.log('✅ Safe parsing of valid JSON PASSED');
    passedTests++;

    // Test 16: Safe parsing of null
    testCount++;
    console.log('\n1️⃣6️⃣ Testing safe parsing of null...');
    const parsedNull = guestValidation.safeParseGuestNames(null);
    if (parsedNull !== null) {
      throw new Error(`Expected null, got ${parsedNull}`);
    }
    console.log('✅ Safe parsing of null PASSED');
    passedTests++;

    // Test 17: Safe parsing of already parsed array (PostgreSQL behavior)
    testCount++;
    console.log('\n1️⃣7️⃣ Testing safe parsing of already parsed array...');
    const alreadyParsed = ['John Doe', 'Jane Smith'];
    const parsedArray = guestValidation.safeParseGuestNames(alreadyParsed);
    if (JSON.stringify(parsedArray) !== JSON.stringify(alreadyParsed)) {
      throw new Error(`Array parsing mismatch`);
    }
    console.log('✅ Safe parsing of already parsed array PASSED');
    passedTests++;

    // Test 18: Safe parsing error - invalid JSON
    testCount++;
    console.log('\n1️⃣8️⃣ Testing safe parsing of invalid JSON...');
    assertThrows(
      () => guestValidation.safeParseGuestNames('invalid json'),
      'Failed to parse guest names JSON',
      'Safe parsing of invalid JSON'
    );
    passedTests++;

    // Test 19: Safe parsing error - JSON that's not an array
    testCount++;
    console.log('\n1️⃣9️⃣ Testing safe parsing of non-array JSON...');
    assertThrows(
      () => guestValidation.safeParseGuestNames('{"not": "array"}'),
      'Guest names JSON must contain an array',
      'Safe parsing of non-array JSON'
    );
    passedTests++;

    // Test 20: Safe parsing error - invalid type
    testCount++;
    console.log('\n2️⃣0️⃣ Testing safe parsing of invalid type...');
    assertThrows(
      () => guestValidation.safeParseGuestNames(123),
      'Guest names must be a string (JSON) or array',
      'Safe parsing of invalid type'
    );
    passedTests++;

    console.log('\n🎉 All Guest Validation Tests Completed!');
    console.log(`📊 Test Results: ${passedTests}/${testCount} tests passed`);

    if (passedTests === testCount) {
      console.log('✅ All tests PASSED - Guest names validation and error handling is robust!');
      console.log('\n📋 Verified Functionality:');
      console.log('   ✅ Guest names array validation (size, type, content)');
      console.log('   ✅ Guest count consistency validation');
      console.log('   ✅ Safe JSON serialization/deserialization');
      console.log('   ✅ Proper error handling for all edge cases');
      console.log('   ✅ Support for undefined/null/empty values');
      console.log('   ✅ Protection against malformed data');
      console.log('   ✅ PostgreSQL JSON/array type compatibility');
    } else {
      console.log('❌ Some tests FAILED - see details above');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test execution failed:');
    console.error(error);
    console.log(`📊 Test Results: ${passedTests}/${testCount} tests passed before failure`);
    process.exit(1);
  }
}

// Self-executing async function
(async () => {
  await testGuestValidation();
  process.exit(0);
})();
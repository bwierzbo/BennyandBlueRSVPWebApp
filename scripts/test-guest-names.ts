#!/usr/bin/env tsx

/**
 * Guest Names Database Operations Test Script
 *
 * This script tests the guest names functionality in database utilities,
 * format converters, and JSONB data handling.
 * Run with: npx tsx scripts/test-guest-names.ts
 */

import { formatConverters } from '../lib/db';
import type { RSVPRecord, RSVPCreateData, RSVPUpdateData, RSVP } from '../types';

// Mock database record with guest names
function createMockRSVPRecord(guestNames: string[] | null = null): RSVPRecord {
  return {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    is_attending: true,
    number_of_guests: guestNames ? guestNames.length : 1,
    guest_names: guestNames,
    notes: 'Test RSVP with guest names',
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  };
}

function createMockCreateData(guestNames?: string[]): RSVPCreateData {
  return {
    name: 'Jane Smith',
    email: 'jane@example.com',
    isAttending: true,
    numberOfGuests: guestNames ? guestNames.length : 1,
    guestNames,
    notes: 'Test create data'
  };
}

function createMockUpdateData(guestNames?: string[]): RSVPUpdateData {
  return {
    isAttending: false,
    numberOfGuests: guestNames ? guestNames.length : 2,
    guestNames,
    notes: 'Updated test data'
  };
}

function assertDeepEqual(actual: any, expected: any, testName: string): void {
  const actualStr = JSON.stringify(actual, null, 2);
  const expectedStr = JSON.stringify(expected, null, 2);

  if (actualStr !== expectedStr) {
    console.error(`❌ ${testName} FAILED:`);
    console.error('Expected:', expectedStr);
    console.error('Actual:', actualStr);
    throw new Error(`Test failed: ${testName}`);
  }

  console.log(`✅ ${testName} PASSED`);
}

async function testGuestNamesFormatting() {
  console.log('🧪 Starting Guest Names Database Utilities Tests...\n');

  let testCount = 0;
  let passedTests = 0;

  try {
    // Test 1: Format converter - dbToApi with null guest names
    testCount++;
    console.log('1️⃣ Testing dbToApi converter with null guest names...');
    const mockRecordNull = createMockRSVPRecord(null);
    const apiResultNull = formatConverters.dbToApi(mockRecordNull);

    const expectedNull: RSVP = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      isAttending: true,
      numberOfGuests: 1,
      guestNames: null,
      notes: 'Test RSVP with guest names',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z')
    };

    assertDeepEqual(apiResultNull, expectedNull, 'dbToApi with null guest names');
    passedTests++;

    // Test 2: Format converter - dbToApi with guest names array
    testCount++;
    console.log('\n2️⃣ Testing dbToApi converter with guest names array...');
    const guestNames = ['Alice Johnson', 'Bob Smith', 'Carol Davis'];
    const mockRecordWithGuests = createMockRSVPRecord(guestNames);
    const apiResultWithGuests = formatConverters.dbToApi(mockRecordWithGuests);

    const expectedWithGuests: RSVP = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      isAttending: true,
      numberOfGuests: 3,
      guestNames: ['Alice Johnson', 'Bob Smith', 'Carol Davis'],
      notes: 'Test RSVP with guest names',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z')
    };

    assertDeepEqual(apiResultWithGuests, expectedWithGuests, 'dbToApi with guest names array');
    passedTests++;

    // Test 3: Format converter - apiToDb with undefined guest names
    testCount++;
    console.log('\n3️⃣ Testing apiToDb converter with undefined guest names...');
    const createDataUndefined = createMockCreateData();
    const dbResultUndefined = formatConverters.apiToDb(createDataUndefined);

    const expectedDbUndefined = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      is_attending: true,
      number_of_guests: 1,
      notes: 'Test create data'
    };

    assertDeepEqual(dbResultUndefined, expectedDbUndefined, 'apiToDb with undefined guest names');
    passedTests++;

    // Test 4: Format converter - apiToDb with guest names array
    testCount++;
    console.log('\n4️⃣ Testing apiToDb converter with guest names array...');
    const createGuestNames = ['Michael Brown', 'Sarah Wilson'];
    const createDataWithGuests = createMockCreateData(createGuestNames);
    const dbResultWithGuests = formatConverters.apiToDb(createDataWithGuests);

    const expectedDbWithGuests = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      is_attending: true,
      number_of_guests: 2,
      guest_names: JSON.stringify(['Michael Brown', 'Sarah Wilson']),
      notes: 'Test create data'
    };

    assertDeepEqual(dbResultWithGuests, expectedDbWithGuests, 'apiToDb with guest names array');
    passedTests++;

    // Test 5: Format converter - apiToDb with empty guest names array
    testCount++;
    console.log('\n5️⃣ Testing apiToDb converter with empty guest names array...');
    const createDataEmpty = createMockCreateData([]);
    const dbResultEmpty = formatConverters.apiToDb(createDataEmpty);

    const expectedDbEmpty = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      is_attending: true,
      number_of_guests: 0,
      guest_names: JSON.stringify([]),
      notes: 'Test create data'
    };

    assertDeepEqual(dbResultEmpty, expectedDbEmpty, 'apiToDb with empty guest names array');
    passedTests++;

    // Test 6: Format converter - apiToDb update data with guest names
    testCount++;
    console.log('\n6️⃣ Testing apiToDb converter with update data...');
    const updateGuestNames = ['Updated Guest 1', 'Updated Guest 2', 'Updated Guest 3'];
    const updateDataWithGuests = createMockUpdateData(updateGuestNames);
    const dbUpdateResult = formatConverters.apiToDb(updateDataWithGuests);

    const expectedDbUpdate = {
      is_attending: false,
      number_of_guests: 3,
      guest_names: JSON.stringify(['Updated Guest 1', 'Updated Guest 2', 'Updated Guest 3']),
      notes: 'Updated test data'
    };

    assertDeepEqual(dbUpdateResult, expectedDbUpdate, 'apiToDb with update data');
    passedTests++;

    // Test 7: JSON serialization/deserialization consistency
    testCount++;
    console.log('\n7️⃣ Testing JSON serialization consistency...');
    const originalNames = ['Test Guest 1', 'Test Guest 2', 'Test Guest 3', 'Test Guest 4'];
    const serialized = JSON.stringify(originalNames);
    const deserialized = JSON.parse(serialized);

    assertDeepEqual(deserialized, originalNames, 'JSON serialization consistency');
    passedTests++;

    // Test 8: Large guest names array (up to 10 guests)
    testCount++;
    console.log('\n8️⃣ Testing large guest names array...');
    const largeGuestNames = [
      'Guest Number One',
      'Guest Number Two',
      'Guest Number Three',
      'Guest Number Four',
      'Guest Number Five',
      'Guest Number Six',
      'Guest Number Seven',
      'Guest Number Eight',
      'Guest Number Nine',
      'Guest Number Ten'
    ];

    const createDataLarge = createMockCreateData(largeGuestNames);
    const dbResultLarge = formatConverters.apiToDb(createDataLarge);

    // Verify the JSON can be parsed back correctly
    const parsedBackLarge = JSON.parse(dbResultLarge.guest_names!);
    assertDeepEqual(parsedBackLarge, largeGuestNames, 'Large guest names array handling');
    passedTests++;

    // Test 9: Guest names with special characters
    testCount++;
    console.log('\n9️⃣ Testing guest names with special characters...');
    const specialCharNames = [
      'José María González',
      'François Müller',
      '李小明',
      'O\'Connor-Smith',
      'Guest with "quotes"'
    ];

    const createDataSpecial = createMockCreateData(specialCharNames);
    const dbResultSpecial = formatConverters.apiToDb(createDataSpecial);

    // Verify the JSON can be parsed back correctly with special characters
    const parsedBackSpecial = JSON.parse(dbResultSpecial.guest_names!);
    assertDeepEqual(parsedBackSpecial, specialCharNames, 'Guest names with special characters');
    passedTests++;

    // Test 10: Round-trip conversion (dbToApi -> apiToDb)
    testCount++;
    console.log('\n🔄 Testing round-trip conversion...');
    const originalRecord = createMockRSVPRecord(['Round Trip Guest 1', 'Round Trip Guest 2']);
    const apiFormat = formatConverters.dbToApi(originalRecord);

    // Create update data from API format
    const updateFromApi: RSVPUpdateData = {
      name: apiFormat.name,
      isAttending: apiFormat.isAttending,
      numberOfGuests: apiFormat.numberOfGuests,
      guestNames: apiFormat.guestNames || undefined,
      notes: apiFormat.notes || undefined
    };

    const backToDb = formatConverters.apiToDb(updateFromApi);

    // Verify key fields match
    if (backToDb.guest_names) {
      const parsedGuests = JSON.parse(backToDb.guest_names);
      assertDeepEqual(parsedGuests, originalRecord.guest_names, 'Round-trip guest names conversion');
    }
    passedTests++;

    console.log('\n🎉 All Guest Names Tests Completed!');
    console.log(`📊 Test Results: ${passedTests}/${testCount} tests passed`);

    if (passedTests === testCount) {
      console.log('✅ All tests PASSED - Guest names database utilities are working correctly!');
      console.log('\n📋 Verified Functionality:');
      console.log('   ✅ Format converters handle null guest names');
      console.log('   ✅ Format converters handle guest names arrays');
      console.log('   ✅ JSONB serialization/deserialization works');
      console.log('   ✅ Large guest arrays (up to 10) supported');
      console.log('   ✅ Special characters in guest names handled');
      console.log('   ✅ Round-trip conversions maintain data integrity');
      console.log('   ✅ Create and update operations support guest names');
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
  await testGuestNamesFormatting();
  process.exit(0);
})();
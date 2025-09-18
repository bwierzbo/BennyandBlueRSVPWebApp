#!/usr/bin/env tsx

/**
 * Integration Test for Guest Names Database Operations
 *
 * This script performs comprehensive integration testing of the enhanced
 * database utilities with guest names support. It tests the complete
 * data flow without requiring a live database connection.
 * Run with: npx tsx scripts/test-integration-guest-names.ts
 */

import { guestValidation, formatConverters } from '../lib/db';
import type { RSVPRecord, RSVPCreateData, RSVPUpdateData, RSVP } from '../types';

// Mock data generator functions
function generateTestRSVPRecord(id: number, guestNames?: string[] | null): RSVPRecord {
  return {
    id,
    name: `Test User ${id}`,
    email: `test${id}@example.com`,
    is_attending: true,
    number_of_guests: guestNames ? guestNames.length : 1,
    guest_names: guestNames || null,
    notes: `Test RSVP ${id}`,
    created_at: new Date(),
    updated_at: new Date()
  };
}

function generateTestCreateData(guestNames?: string[]): RSVPCreateData {
  return {
    name: 'New Test User',
    email: 'newtest@example.com',
    isAttending: true,
    numberOfGuests: guestNames ? guestNames.length : 1,
    guestNames,
    notes: 'New test RSVP'
  };
}

function generateTestUpdateData(guestNames?: string[]): RSVPUpdateData {
  return {
    isAttending: false,
    numberOfGuests: guestNames ? guestNames.length : 2,
    guestNames,
    notes: 'Updated test RSVP'
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

// Mock database create operation validation
function mockDatabaseCreate(createData: RSVPCreateData): RSVP {
  // This simulates the validation and processing that happens in rsvpDb.create()

  // Validate guest names
  const guestValidationResult = guestValidation.validateGuestNames(createData.guestNames);
  if (!guestValidationResult.isValid) {
    throw new Error(`Invalid guest names: ${guestValidationResult.error}`);
  }

  // Validate guest count consistency
  const countValidationResult = guestValidation.validateGuestCount(createData.numberOfGuests, createData.guestNames);
  if (!countValidationResult.isValid) {
    throw new Error(`Invalid guest count: ${countValidationResult.error}`);
  }

  // Simulate database serialization
  const guestNamesJson = guestValidation.safeSerializeGuestNames(createData.guestNames);

  // Simulate database storage and retrieval
  const mockDbRecord: RSVPRecord = {
    id: 1,
    name: createData.name,
    email: createData.email,
    is_attending: createData.isAttending,
    number_of_guests: createData.numberOfGuests,
    guest_names: guestNamesJson ? JSON.parse(guestNamesJson) : null, // Simulate PostgreSQL JSONB parsing
    notes: createData.notes || null,
    created_at: new Date(),
    updated_at: new Date()
  };

  // Convert back to API format
  return formatConverters.dbToApi(mockDbRecord);
}

// Mock database update operation validation
function mockDatabaseUpdate(originalRecord: RSVPRecord, updateData: RSVPUpdateData): RSVP {
  // This simulates the validation and processing that happens in rsvpDb.update()

  // Validate guest names if provided
  if (updateData.guestNames !== undefined) {
    const guestValidationResult = guestValidation.validateGuestNames(updateData.guestNames);
    if (!guestValidationResult.isValid) {
      throw new Error(`Invalid guest names: ${guestValidationResult.error}`);
    }

    // Validate guest count consistency if both are being updated
    if (updateData.numberOfGuests !== undefined) {
      const countValidationResult = guestValidation.validateGuestCount(updateData.numberOfGuests, updateData.guestNames);
      if (!countValidationResult.isValid) {
        throw new Error(`Invalid guest count: ${countValidationResult.error}`);
      }
    }
  }

  // Simulate the update process
  const updatedDbRecord: RSVPRecord = {
    ...originalRecord,
    is_attending: updateData.isAttending !== undefined ? updateData.isAttending : originalRecord.is_attending,
    number_of_guests: updateData.numberOfGuests !== undefined ? updateData.numberOfGuests : originalRecord.number_of_guests,
    guest_names: updateData.guestNames !== undefined
      ? (updateData.guestNames ? updateData.guestNames : null)
      : originalRecord.guest_names,
    notes: updateData.notes !== undefined ? updateData.notes : originalRecord.notes,
    updated_at: new Date()
  };

  return formatConverters.dbToApi(updatedDbRecord);
}

async function testIntegration() {
  console.log('🧪 Starting Guest Names Integration Tests...\n');

  let testCount = 0;
  let passedTests = 0;

  try {
    // Test 1: Complete create workflow - no guest names
    testCount++;
    console.log('1️⃣ Testing complete create workflow without guest names...');
    const createDataNoGuests = generateTestCreateData();
    const resultNoGuests = mockDatabaseCreate(createDataNoGuests);

    const expectedNoGuests: Partial<RSVP> = {
      name: 'New Test User',
      email: 'newtest@example.com',
      isAttending: true,
      numberOfGuests: 1,
      guestNames: null,
      notes: 'New test RSVP'
    };

    assertDeepEqual(
      {
        name: resultNoGuests.name,
        email: resultNoGuests.email,
        isAttending: resultNoGuests.isAttending,
        numberOfGuests: resultNoGuests.numberOfGuests,
        guestNames: resultNoGuests.guestNames,
        notes: resultNoGuests.notes
      },
      expectedNoGuests,
      'Complete create workflow without guest names'
    );
    passedTests++;

    // Test 2: Complete create workflow - with guest names
    testCount++;
    console.log('\n2️⃣ Testing complete create workflow with guest names...');
    const guestNames = ['Alice Johnson', 'Bob Smith', 'Carol Davis'];
    const createDataWithGuests = generateTestCreateData(guestNames);
    const resultWithGuests = mockDatabaseCreate(createDataWithGuests);

    const expectedWithGuests: Partial<RSVP> = {
      name: 'New Test User',
      email: 'newtest@example.com',
      isAttending: true,
      numberOfGuests: 3,
      guestNames: ['Alice Johnson', 'Bob Smith', 'Carol Davis'],
      notes: 'New test RSVP'
    };

    assertDeepEqual(
      {
        name: resultWithGuests.name,
        email: resultWithGuests.email,
        isAttending: resultWithGuests.isAttending,
        numberOfGuests: resultWithGuests.numberOfGuests,
        guestNames: resultWithGuests.guestNames,
        notes: resultWithGuests.notes
      },
      expectedWithGuests,
      'Complete create workflow with guest names'
    );
    passedTests++;

    // Test 3: Create workflow validation error - too many guests
    testCount++;
    console.log('\n3️⃣ Testing create workflow validation error...');
    const tooManyGuests = Array.from({ length: 11 }, (_, i) => `Guest ${i + 1}`);
    const createDataTooMany = generateTestCreateData(tooManyGuests);

    assertThrows(
      () => mockDatabaseCreate(createDataTooMany),
      'Maximum 10 guest names allowed',
      'Create workflow validation error'
    );
    passedTests++;

    // Test 4: Create workflow validation error - mismatched count
    testCount++;
    console.log('\n4️⃣ Testing create workflow count mismatch error...');
    const createDataMismatch: RSVPCreateData = {
      name: 'Test User',
      email: 'test@example.com',
      isAttending: true,
      numberOfGuests: 5,
      guestNames: ['Guest 1', 'Guest 2'], // Only 2 guests but count is 5
      notes: 'Test'
    };

    assertThrows(
      () => mockDatabaseCreate(createDataMismatch),
      'must match guest names count',
      'Create workflow count mismatch error'
    );
    passedTests++;

    // Test 5: Complete update workflow - adding guest names
    testCount++;
    console.log('\n5️⃣ Testing complete update workflow - adding guest names...');
    const originalRecord = generateTestRSVPRecord(1, null);
    const updateWithGuests = generateTestUpdateData(['New Guest 1', 'New Guest 2']);
    const updateResult = mockDatabaseUpdate(originalRecord, updateWithGuests);

    const expectedUpdate: Partial<RSVP> = {
      isAttending: false,
      numberOfGuests: 2,
      guestNames: ['New Guest 1', 'New Guest 2'],
      notes: 'Updated test RSVP'
    };

    assertDeepEqual(
      {
        isAttending: updateResult.isAttending,
        numberOfGuests: updateResult.numberOfGuests,
        guestNames: updateResult.guestNames,
        notes: updateResult.notes
      },
      expectedUpdate,
      'Complete update workflow - adding guest names'
    );
    passedTests++;

    // Test 6: Complete update workflow - removing guest names
    testCount++;
    console.log('\n6️⃣ Testing complete update workflow - removing guest names...');
    const originalWithGuests = generateTestRSVPRecord(2, ['Guest 1', 'Guest 2']);
    const updateRemoveGuests: RSVPUpdateData = {
      numberOfGuests: 1,
      guestNames: []
    };
    const removeResult = mockDatabaseUpdate(originalWithGuests, updateRemoveGuests);

    assertDeepEqual(
      {
        numberOfGuests: removeResult.numberOfGuests,
        guestNames: removeResult.guestNames
      },
      {
        numberOfGuests: 1,
        guestNames: []
      },
      'Complete update workflow - removing guest names'
    );
    passedTests++;

    // Test 7: Update workflow validation error
    testCount++;
    console.log('\n7️⃣ Testing update workflow validation error...');
    const originalForError = generateTestRSVPRecord(3, ['Guest 1']);
    const invalidUpdate: RSVPUpdateData = {
      numberOfGuests: 3,
      guestNames: ['Guest 1'] // Count mismatch: 3 vs 1
    };

    assertThrows(
      () => mockDatabaseUpdate(originalForError, invalidUpdate),
      'must match guest names count',
      'Update workflow validation error'
    );
    passedTests++;

    // Test 8: Round-trip data integrity test
    testCount++;
    console.log('\n8️⃣ Testing round-trip data integrity...');
    const originalData = ['José María González', 'François Müller', '李小明'];
    const createDataRoundTrip = generateTestCreateData(originalData);
    const roundTripResult = mockDatabaseCreate(createDataRoundTrip);

    assertDeepEqual(
      roundTripResult.guestNames,
      originalData,
      'Round-trip data integrity'
    );
    passedTests++;

    // Test 9: Large guest list handling
    testCount++;
    console.log('\n9️⃣ Testing large guest list handling...');
    const maxGuests = Array.from({ length: 10 }, (_, i) => `Guest Number ${i + 1}`);
    const createDataMax = generateTestCreateData(maxGuests);
    const maxResult = mockDatabaseCreate(createDataMax);

    assertDeepEqual(
      maxResult.guestNames,
      maxGuests,
      'Large guest list handling'
    );
    passedTests++;

    // Test 10: Mixed operations workflow
    testCount++;
    console.log('\n🔟 Testing mixed operations workflow...');

    // Create with no guests
    const mixedCreate = generateTestCreateData();
    const mixedResult1 = mockDatabaseCreate(mixedCreate);

    // Update to add guests
    const mixedUpdate1: RSVPUpdateData = {
      numberOfGuests: 2,
      guestNames: ['Added Guest 1', 'Added Guest 2']
    };
    const mockRecord1 = generateTestRSVPRecord(1, null);
    const mixedResult2 = mockDatabaseUpdate(mockRecord1, mixedUpdate1);

    // Update to modify guests
    const mixedUpdate2: RSVPUpdateData = {
      numberOfGuests: 3,
      guestNames: ['Modified Guest 1', 'Modified Guest 2', 'Modified Guest 3']
    };
    const mockRecord2 = generateTestRSVPRecord(1, ['Added Guest 1', 'Added Guest 2']);
    const mixedResult3 = mockDatabaseUpdate(mockRecord2, mixedUpdate2);

    if (mixedResult1.guestNames !== null) {
      throw new Error('Initial create should have null guest names');
    }
    if (mixedResult2.guestNames?.length !== 2) {
      throw new Error('First update should have 2 guest names');
    }
    if (mixedResult3.guestNames?.length !== 3) {
      throw new Error('Second update should have 3 guest names');
    }

    console.log('✅ Mixed operations workflow PASSED');
    passedTests++;

    console.log('\n🎉 All Integration Tests Completed!');
    console.log(`📊 Test Results: ${passedTests}/${testCount} tests passed`);

    if (passedTests === testCount) {
      console.log('✅ All tests PASSED - Guest names integration is working correctly!');
      console.log('\n📋 Verified Integration Scenarios:');
      console.log('   ✅ Complete create workflow (with and without guests)');
      console.log('   ✅ Complete update workflow (add, modify, remove guests)');
      console.log('   ✅ Validation error handling in real workflows');
      console.log('   ✅ Data integrity across operations');
      console.log('   ✅ Large guest list processing');
      console.log('   ✅ Special character handling');
      console.log('   ✅ Complex mixed operation sequences');
      console.log('   ✅ Database serialization/deserialization simulation');
    } else {
      console.log('❌ Some tests FAILED - see details above');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Integration test execution failed:');
    console.error(error);
    console.log(`📊 Test Results: ${passedTests}/${testCount} tests passed before failure`);
    process.exit(1);
  }
}

// Self-executing async function
(async () => {
  await testIntegration();
  process.exit(0);
})();
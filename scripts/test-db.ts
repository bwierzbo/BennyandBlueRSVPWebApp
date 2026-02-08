#!/usr/bin/env tsx

/**
 * Database test script
 *
 * This script tests the database connection and basic RSVP operations.
 * Run with: npx tsx scripts/test-db.ts
 */

import { db, rsvpDb } from '../lib/db';

async function testDatabase() {
  console.log('🧪 Starting database tests...');

  try {
    // Test 1: Database connection
    console.log('\n1️⃣ Testing database connection...');
    const isConnected = await db.testConnection();

    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    console.log('✅ Database connection successful');

    // Test 2: Create test RSVP
    console.log('\n2️⃣ Testing RSVP creation...');
    const testRSVP = await rsvpDb.create({
      name: 'Test Guest',
      email: 'test@example.com',
      isAttending: true,
      numberOfGuests: 2,
      guestNames: ['Guest 1', 'Guest 2'],
      notes: 'Test RSVP entry'
    });
    if (!testRSVP) {
      throw new Error('RSVP creation returned null (email conflict)');
    }
    console.log('✅ RSVP created:', testRSVP);

    // Test 3: Get RSVP by email
    console.log('\n3️⃣ Testing RSVP retrieval by email...');
    const retrievedRSVP = await rsvpDb.getByEmail('test@example.com');
    console.log('✅ RSVP retrieved:', retrievedRSVP);

    // Test 4: Update RSVP
    console.log('\n4️⃣ Testing RSVP update...');
    const updatedRSVP = await rsvpDb.update(testRSVP.id, {
      numberOfGuests: 3,
      notes: 'Updated test RSVP entry'
    });
    console.log('✅ RSVP updated:', updatedRSVP);

    // Test 5: Get all RSVPs
    console.log('\n5️⃣ Testing get all RSVPs...');
    const allRSVPs = await rsvpDb.getAll();
    console.log(`✅ Retrieved ${allRSVPs.length} RSVP(s)`);

    // Test 6: Get RSVP statistics
    console.log('\n6️⃣ Testing RSVP statistics...');
    const stats = await rsvpDb.getStats();
    console.log('✅ RSVP statistics:', stats);

    // Test 7: Clean up - Delete test RSVP
    console.log('\n7️⃣ Cleaning up test data...');
    const deletedRSVP = await rsvpDb.delete(testRSVP.id);
    console.log('✅ Test RSVP deleted:', deletedRSVP?.email);

    console.log('\n🎉 All database tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Database connection working');
    console.log('   ✅ RSVP creation working');
    console.log('   ✅ RSVP retrieval working');
    console.log('   ✅ RSVP update working');
    console.log('   ✅ RSVP listing working');
    console.log('   ✅ RSVP statistics working');
    console.log('   ✅ RSVP deletion working');

  } catch (error) {
    console.error('\n❌ Database test failed:');
    console.error(error);
    process.exit(1);
  }
}

// Self-executing async function
(async () => {
  await testDatabase();
  process.exit(0);
})();
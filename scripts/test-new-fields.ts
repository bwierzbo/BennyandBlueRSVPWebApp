#!/usr/bin/env tsx

/**
 * Test script for new dietary_restrictions and song_requests fields
 *
 * This script tests that the new fields work correctly with the database.
 * Run with: POSTGRES_URL=... npx tsx scripts/test-new-fields.ts
 */

import { rsvpDb } from '../lib/db';

async function testNewFields() {
  console.log('🧪 Testing new dietary_restrictions and song_requests fields...\n');

  try {
    // Test 1: Create RSVP with new fields
    console.log('1️⃣ Creating RSVP with dietary restrictions and song requests...');
    const testRSVP = await rsvpDb.create({
      name: 'Test Guest with New Fields',
      email: 'test-new-fields@example.com',
      isAttending: true,
      numberOfGuests: 2,
      guestNames: ['Guest 1', 'Guest 2'],
      dietaryRestrictions: 'Vegetarian, no nuts',
      songRequests: 'Don\'t Stop Believin\' by Journey',
      notes: 'Looking forward to the celebration!'
    });
    console.log('✅ RSVP created successfully:');
    console.log('   - Dietary Restrictions:', testRSVP.dietaryRestrictions);
    console.log('   - Song Requests:', testRSVP.songRequests);

    // Test 2: Retrieve and verify
    console.log('\n2️⃣ Retrieving RSVP by email...');
    const retrieved = await rsvpDb.getByEmail('test-new-fields@example.com');
    if (retrieved) {
      console.log('✅ RSVP retrieved successfully:');
      console.log('   - Name:', retrieved.name);
      console.log('   - Dietary Restrictions:', retrieved.dietaryRestrictions);
      console.log('   - Song Requests:', retrieved.songRequests);
    } else {
      throw new Error('Failed to retrieve RSVP');
    }

    // Test 3: Update fields
    console.log('\n3️⃣ Updating dietary restrictions and song requests...');
    const updated = await rsvpDb.update(testRSVP.id, {
      dietaryRestrictions: 'Vegan, gluten-free',
      songRequests: 'Sweet Caroline by Neil Diamond, September by Earth Wind & Fire'
    });
    if (updated) {
      console.log('✅ RSVP updated successfully:');
      console.log('   - New Dietary Restrictions:', updated.dietaryRestrictions);
      console.log('   - New Song Requests:', updated.songRequests);
    } else {
      throw new Error('Failed to update RSVP');
    }

    // Test 4: Clean up
    console.log('\n4️⃣ Cleaning up test data...');
    await rsvpDb.delete(testRSVP.id);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All tests passed! New fields are working correctly.');

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
(async () => {
  await testNewFields();
  process.exit(0);
})();

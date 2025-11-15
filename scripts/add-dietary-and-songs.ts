#!/usr/bin/env tsx

/**
 * Migration script to add dietary_restrictions and song_requests fields
 *
 * This script adds new columns to the existing RSVP table.
 * Run with: npx tsx scripts/add-dietary-and-songs.ts
 */

import { sql } from '../lib/db';

async function migrateDatabaseSchema() {
  console.log('🚀 Starting database migration...');
  console.log('   Adding dietary_restrictions and song_requests fields');

  try {
    // Test database connection first
    console.log('\n📡 Testing database connection...');
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');

    // Add dietary_restrictions column
    console.log('\n1️⃣ Adding dietary_restrictions column...');
    try {
      await sql`
        ALTER TABLE rsvp
        ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT
      `;
      console.log('✅ dietary_restrictions column added');
    } catch (error: any) {
      if (error.code === '42701') {
        console.log('ℹ️  dietary_restrictions column already exists');
      } else {
        throw error;
      }
    }

    // Add song_requests column
    console.log('\n2️⃣ Adding song_requests column...');
    try {
      await sql`
        ALTER TABLE rsvp
        ADD COLUMN IF NOT EXISTS song_requests TEXT
      `;
      console.log('✅ song_requests column added');
    } catch (error: any) {
      if (error.code === '42701') {
        console.log('ℹ️  song_requests column already exists');
      } else {
        throw error;
      }
    }

    console.log('\n🎉 Database migration completed successfully!');
    console.log('\n📊 Updated schema:');
    console.log('   ✅ dietary_restrictions TEXT - For guest dietary needs');
    console.log('   ✅ song_requests TEXT - For song requests from guests');

  } catch (error) {
    console.error('\n❌ Database migration failed:');
    console.error(error);
    process.exit(1);
  }
}

// Self-executing async function
(async () => {
  await migrateDatabaseSchema();
  process.exit(0);
})();

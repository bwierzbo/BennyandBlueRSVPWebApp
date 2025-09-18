#!/usr/bin/env tsx

/**
 * Database migration script to add guest_names JSONB field
 *
 * This script adds the guest_names JSONB column to existing rsvp tables.
 * It's designed to be backward compatible and safe to run multiple times.
 *
 * Run with: npx tsx scripts/add-guest-names-migration.ts
 */

import { sql } from '@vercel/postgres';

async function addGuestNamesMigration() {
  console.log('🚀 Starting guest_names migration...');

  try {
    // Test database connection first
    console.log('📡 Testing database connection...');
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');

    // Check if guest_names column already exists
    console.log('🔍 Checking if guest_names column exists...');
    const columnCheck = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'rsvp'
      AND column_name = 'guest_names'
    `;

    if (columnCheck.rows.length > 0) {
      console.log('ℹ️  guest_names column already exists. Migration not needed.');
      return;
    }

    // Add guest_names column
    console.log('🏗️  Adding guest_names JSONB column...');
    await sql`
      ALTER TABLE rsvp
      ADD COLUMN guest_names JSONB DEFAULT NULL
    `;

    console.log('✅ guest_names column added successfully!');

    // Verify the column was added
    console.log('🔍 Verifying column was added...');
    const verifyCheck = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'rsvp'
      AND column_name = 'guest_names'
    `;

    if (verifyCheck.rows.length === 0) {
      throw new Error('Failed to verify guest_names column creation');
    }

    const columnInfo = verifyCheck.rows[0];
    console.log('✅ Column verification successful:');
    console.log(`   - Column: ${columnInfo.column_name}`);
    console.log(`   - Type: ${columnInfo.data_type}`);
    console.log(`   - Nullable: ${columnInfo.is_nullable}`);
    console.log(`   - Default: ${columnInfo.column_default || 'NULL'}`);

    console.log('');
    console.log('🎉 Migration completed successfully!');
    console.log('📊 Database schema updated:');
    console.log('   - guest_names JSONB field added to rsvp table');
    console.log('   - Existing data remains unchanged (backward compatible)');
    console.log('   - New RSVPs can store up to 10 guest names');

  } catch (error) {
    console.error('❌ Migration failed:');
    console.error(error);
    process.exit(1);
  }
}

// Self-executing async function
(async () => {
  await addGuestNamesMigration();
  process.exit(0);
})();
#!/usr/bin/env tsx

/**
 * Migration script to add the seating chart tables
 *
 * Creates seating_table and seating_assignment. Safe to run more than once.
 * Run with: npm run db:seating
 */

import { db, sql } from '../lib/db';

async function migrateSeatingTables() {
  console.log('🚀 Starting seating chart migration...');

  try {
    console.log('\n📡 Testing database connection...');
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');

    console.log('\n🏗️  Creating seating tables...');
    await db.initializeSeatingTables();
    console.log('✅ seating_table and seating_assignment are ready');

    const tables = await sql`SELECT COUNT(*)::int AS count FROM seating_table`;
    const assignments = await sql`SELECT COUNT(*)::int AS count FROM seating_assignment`;

    console.log('\n🎉 Seating chart migration completed successfully!');
    console.log(`   Tables: ${tables.rows[0].count}`);
    console.log(`   Seated guests: ${assignments.rows[0].count}`);
    console.log('\n   Open /admin/seating to start planning.');
  } catch (error) {
    console.error('\n❌ Seating chart migration failed:');
    console.error(error);
    process.exit(1);
  }
}

// Self-executing async function
(async () => {
  await migrateSeatingTables();
  process.exit(0);
})();

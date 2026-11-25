#!/usr/bin/env tsx

/**
 * Migration script to add the guest_uploads table
 *
 * Records every photo/video a guest uploads from /memories (the files
 * themselves live in Vercel Blob). Safe to run more than once.
 * Run with: npm run db:uploads
 */

import { db, sql } from '../lib/db';

async function migrateGuestUploadsTable() {
  console.log('🚀 Starting guest uploads migration...');

  try {
    console.log('\n📡 Testing database connection...');
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');

    console.log('\n🏗️  Creating guest_uploads table...');
    await db.initializeUploadsTable();
    console.log('✅ guest_uploads is ready');

    const uploads = await sql`SELECT COUNT(*)::int AS count FROM guest_uploads`;

    console.log('\n🎉 Guest uploads migration completed successfully!');
    console.log(`   Uploads recorded: ${uploads.rows[0].count}`);
    console.log('\n   Open /admin/uploads to see what guests have shared.');
  } catch (error) {
    console.error('\n❌ Guest uploads migration failed:');
    console.error(error);
    process.exit(1);
  }
}

// Self-executing async function
(async () => {
  await migrateGuestUploadsTable();
  process.exit(0);
})();

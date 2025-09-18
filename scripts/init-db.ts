#!/usr/bin/env tsx

/**
 * Database initialization script
 *
 * This script initializes the database with the required tables and indexes.
 * Run with: npx tsx scripts/init-db.ts
 */

import { db } from '../lib/db';

async function initializeDatabase() {
  console.log('🚀 Starting database initialization...');

  try {
    // Test database connection first
    console.log('📡 Testing database connection...');
    const isConnected = await db.testConnection();

    if (!isConnected) {
      throw new Error('Failed to connect to database. Please check your POSTGRES_URL environment variable.');
    }

    console.log('✅ Database connection successful');

    // Initialize tables
    console.log('🏗️  Creating database tables...');
    await db.initializeTables();

    console.log('✅ Database initialization completed successfully!');
    console.log('');
    console.log('📊 Database is ready for RSVP operations:');
    console.log('   - RSVP table created with proper schema');
    console.log('   - Indexes created for optimal performance');
    console.log('   - Triggers set up for automatic timestamp updates');

  } catch (error) {
    console.error('❌ Database initialization failed:');
    console.error(error);
    process.exit(1);
  }
}

// Self-executing async function
(async () => {
  await initializeDatabase();
  process.exit(0);
})();
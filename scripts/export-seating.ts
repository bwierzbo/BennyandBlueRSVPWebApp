#!/usr/bin/env tsx

/**
 * Export the seating chart (tables + guest names) as CSV from the command line.
 *
 * Produces the same rows as the /admin/seating "Export CSV" button.
 * Run with: npm run db:export-seating [-- output.csv]
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// The db scripts run outside Next.js, so .env.local is not loaded for us.
function loadEnvLocal(): void {
  let content: string;
  try {
    content = readFileSync(resolve(__dirname, '../.env.local'), 'utf8');
  } catch {
    return; // no .env.local — rely on the ambient environment
  }
  for (const line of content.split('\n')) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (!match) continue;
    const [, key, raw] = match;
    if (process.env[key]) continue;
    process.env[key] = raw.replace(/^["']|["']$/g, '');
  }
}

async function exportSeating() {
  loadEnvLocal();

  // Import after env is set so @vercel/postgres sees POSTGRES_URL
  const { rsvpDb, seatingDb } = await import('../lib/db');
  const { buildParties, buildSeatingPlan } = await import('../lib/seating');
  const { escapeCsvValue } = await import('../lib/utils');

  const [rsvps, tables, assignments] = await Promise.all([
    rsvpDb.getAll(),
    seatingDb.getTables(),
    seatingDb.getAssignments(),
  ]);
  const plan = buildSeatingPlan(buildParties(rsvps), tables, assignments);

  const headers = ['Table', 'Guest', 'Party', 'Role', 'Dietary Restrictions'];
  const rows: string[] = [];

  for (const table of plan.tables) {
    for (const person of table.people) {
      rows.push(
        [
          table.name,
          person.name,
          person.partyName,
          person.isPrimary ? 'RSVP contact' : 'Plus one',
          person.dietaryRestrictions ?? '',
        ]
          .map(escapeCsvValue)
          .join(',')
      );
    }
  }

  for (const party of plan.unseatedParties) {
    for (const person of party.people) {
      rows.push(
        [
          'Unseated',
          person.name,
          person.partyName,
          person.isPrimary ? 'RSVP contact' : 'Plus one',
          person.dietaryRestrictions ?? '',
        ]
          .map(escapeCsvValue)
          .join(',')
      );
    }
  }

  const outPath = resolve(
    process.argv[2] ?? `seating-chart-${new Date().toISOString().split('T')[0]}.csv`
  );
  // BOM so Excel reads UTF-8 characters correctly
  writeFileSync(outPath, '﻿' + [headers.join(','), ...rows].join('\r\n'));

  console.log(`✅ Exported ${plan.seatedCount} seated + ${plan.unseatedCount} unseated guests`);
  console.log(`   Tables: ${plan.tables.length}`);
  console.log(`   File: ${outPath}`);
}

(async () => {
  try {
    await exportSeating();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seating export failed:');
    console.error(error);
    process.exit(1);
  }
})();

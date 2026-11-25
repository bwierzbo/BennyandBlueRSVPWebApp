#!/usr/bin/env tsx

/**
 * Bulk download of everything guests uploaded from /memories
 *
 * Copies the private Blob store's guests/ folder to a local directory, keeping
 * the same folder layout. Files already downloaded at the right size are
 * skipped, so it is safe to re-run to pick up new uploads.
 *
 * Needs BLOB_READ_WRITE_TOKEN in the environment.
 * Run with: npm run uploads:download            (saves to ./guest-media)
 *       or: npm run uploads:download -- <dir>
 */

import { createWriteStream } from 'fs';
import { mkdir, stat } from 'fs/promises';
import { dirname, join, resolve } from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import type { ReadableStream as NodeReadableStream } from 'stream/web';
import { get, list } from '@vercel/blob';
import { formatBytes } from '../lib/memories';

const UPLOADS_PREFIX = 'guests/';

async function existingSize(path: string): Promise<number | null> {
  try {
    return (await stat(path)).size;
  } catch {
    return null;
  }
}

async function downloadGuestUploads(outputDir: string) {
  console.log(`🚀 Downloading guest uploads to ${outputDir}`);

  let cursor: string | undefined;
  let downloaded = 0;
  let skipped = 0;
  let bytes = 0;

  do {
    const page = await list({ prefix: UPLOADS_PREFIX, cursor, limit: 1000 });

    for (const blob of page.blobs) {
      const target = join(outputDir, blob.pathname);

      if ((await existingSize(target)) === blob.size) {
        skipped++;
        continue;
      }

      const result = await get(blob.pathname, { access: 'private' });
      if (!result || result.statusCode !== 200 || !result.stream) {
        throw new Error(`Could not read ${blob.pathname} from the Blob store`);
      }

      await mkdir(dirname(target), { recursive: true });
      await pipeline(
        Readable.fromWeb(result.stream as unknown as NodeReadableStream),
        createWriteStream(target)
      );

      downloaded++;
      bytes += blob.size;
      console.log(`   ✅ ${blob.pathname} (${formatBytes(blob.size)})`);
    }

    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  console.log(`\n🎉 Done: ${downloaded} downloaded (${formatBytes(bytes)}), ${skipped} already up to date`);
}

// Self-executing async function
(async () => {
  try {
    await downloadGuestUploads(resolve(process.argv[2] ?? 'guest-media'));
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Download failed:');
    console.error(error);
    process.exit(1);
  }
})();

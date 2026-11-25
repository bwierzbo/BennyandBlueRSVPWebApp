# Memories Page Setup

`/memories` is where the QR code on the thank-you postcards lands. It shows the
wedding film and lets guests upload photos and videos straight from their phone
into a private Vercel Blob store. Uploads go browser → Blob directly, so file
size is not limited by Vercel's 4.5 MB request body cap, and large videos are
sent in parts so a dropped connection retries a part instead of the whole file.

| Piece | Where |
| --- | --- |
| Page | `app/memories/page.tsx`, `components/memories-uploader.tsx` |
| Issue upload tokens | `POST /api/memories/sign` |
| Record finished uploads | `POST /api/memories/complete` → `guest_uploads` table |
| Admin view | `/admin/uploads` |
| Storage helpers | `lib/blob.ts` |
| Limits & key format | `lib/memories.ts` (50 files per batch, 4.5 GB per file, image/video only) |

Files are stored as `guests/<guest-name-or-guest>/<YYYYMMDD>/<uuid>-<filename>`.

## Already set up

- **Blob store**: `bennyandblue-guest-media` (private, region `pdx1`), connected to
  the `bennyand-blue-rsvp-web-app` Vercel project.
- **`BLOB_READ_WRITE_TOKEN`**: added to the project automatically when the store
  was connected (production, preview and development).
- **`NEXT_PUBLIC_FILM_YOUTUBE_ID`**: set for production and preview.

There is no CORS rule, bucket policy or separate API token to manage.

## Still to do: create the database table

```bash
npm run db:uploads
```

Like the other `db:*` scripts this needs `POSTGRES_URL` in the environment
(for example `set -a; source .env.local; set +a` first). It is safe to run more
than once. Until it has run, files still upload but the page reports
"Could not record the upload" and nothing appears in `/admin/uploads`.

## Environment variables

| Variable | Value |
| --- | --- |
| `BLOB_READ_WRITE_TOKEN` | Set by Vercel when the Blob store is connected. Server-side only |
| `NEXT_PUBLIC_FILM_YOUTUBE_ID` | The video ID: the part after `youtu.be/` or `watch?v=` |
| `NEXT_PUBLIC_FILM_MP4_URL` | Optional. Direct MP4 URL; when set it replaces the YouTube embed |

`NEXT_PUBLIC_*` values are baked in at build time, so **redeploy** after
changing the film variables. Without them the page shows a "Film coming soon"
card. Without `BLOB_READ_WRITE_TOKEN` the page still renders, and uploads fail
with a friendly "not available right now" message.

For local development, pull the token into `.env.local`:

```bash
vercel link
vercel env pull .env.local
```

`vercel env pull` overwrites `.env.local`, so back it up first if it holds
values that are not in Vercel.

## Test it

1. Open `/memories`, pick a photo, and watch it reach "Done".
2. Open `/admin/uploads`: the file is listed under the name you entered, with a
   link that expires after 15 minutes (reload for a fresh one).

## Bulk download

```bash
npm run uploads:download              # saves to ./guest-media
npm run uploads:download -- ~/Wedding # or any other folder
```

Needs `BLOB_READ_WRITE_TOKEN` in the environment. It keeps the `guests/...`
folder layout and skips files that are already downloaded, so re-run it any
time to fetch new uploads. `./guest-media` is gitignored.

You can also browse the files in the Vercel dashboard under **Storage →
bennyandblue-guest-media**.

## Recreating the store

If the store ever has to be rebuilt: Vercel dashboard → **Storage** → **Create
Database** → **Blob**, choose **Private** access, and connect it to the project.
Connecting it sets `BLOB_READ_WRITE_TOKEN`; redeploy afterwards.

## Notes

- **Abuse protection**: `/api/memories/sign` allows 20 requests per minute per IP
  (each request can cover up to 50 files). The limit is in-memory per server
  instance, so it is a speed bump, not a guarantee. Each upload token works for
  one pathname, one content type and at most the validated size, and cannot
  overwrite an existing file; Vercel Blob rejects anything else.
- **Privacy**: the store is private. Files are readable only with the
  read-write token or a short-lived signed link from `/admin/uploads`.
- **Cost**: Blob storage and transfer are billed to the Vercel team. Check
  usage under **Storage** in the dashboard once guests start uploading video.
- **Orphans**: `guest_uploads` is written only after the store confirms the
  file exists. A file whose upload finished but whose record failed is still in
  the store and still comes down with `npm run uploads:download`.

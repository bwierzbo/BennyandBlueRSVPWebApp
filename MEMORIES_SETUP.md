# Memories Page Setup

`/memories` is where the QR code on the thank-you postcards lands. It shows the
wedding film and lets guests upload photos and videos straight from their phone
into a private Cloudflare R2 bucket. Uploads go browser → R2 directly through
presigned URLs, so file size is not limited by Vercel's 4.5 MB request body cap.

| Piece | Where |
| --- | --- |
| Page | `app/memories/page.tsx`, `components/memories-uploader.tsx` |
| Presign uploads | `POST /api/memories/sign` |
| Record finished uploads | `POST /api/memories/complete` → `guest_uploads` table |
| Admin view | `/admin/uploads` |
| Limits & key format | `lib/memories.ts` (50 files per batch, 4.5 GB per file, image/video only) |

Objects are stored as `guests/<guest-name-or-guest>/<YYYYMMDD>/<uuid>-<filename>`.

## 1. Create the bucket

```bash
npx wrangler login
npx wrangler r2 bucket create bennyandblue-guest-media
```

Leave the bucket private (no public access, no r2.dev URL).

## 2. Allow browser uploads (CORS)

Guests' browsers `PUT` directly to R2, so the bucket has to allow that from the site's origins.

Save as `cors.json`:

```json
{
  "rules": [
    {
      "allowed": {
        "origins": [
          "https://bennyandblue.com",
          "https://www.bennyandblue.com",
          "http://localhost:3000"
        ],
        "methods": ["PUT"],
        "headers": ["content-type"]
      },
      "maxAgeSeconds": 3600
    }
  ]
}
```

Apply and verify:

```bash
npx wrangler r2 bucket cors set bennyandblue-guest-media --file cors.json
npx wrangler r2 bucket cors list bennyandblue-guest-media
```

Changes can take about 30 seconds to apply. If uploads fail at 0% with a CORS
error in the browser console, this rule is the first thing to check. Vercel
preview deployments use a different origin and are not covered by it.

## 3. Create an R2 API token

1. Cloudflare dashboard → **R2 object storage** → **Overview**.
2. Under **Account Details**, select **Manage** next to **API Tokens**.
3. **Create Account API token**.
4. Permissions: **Object Read & Write**.
5. Scope it to **only** the `bennyandblue-guest-media` bucket.
6. Create the token and copy the **Access Key ID** and **Secret Access Key**
   (the secret is shown once).

The **Account ID** is shown on the same R2 overview page. It is the
`<ACCOUNT_ID>` part of `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.

## 4. Environment variables

| Variable | Value |
| --- | --- |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | Access Key ID from step 3 |
| `R2_SECRET_ACCESS_KEY` | Secret Access Key from step 3 |
| `R2_BUCKET` | `bennyandblue-guest-media` |
| `NEXT_PUBLIC_FILM_YOUTUBE_ID` | The video ID: the part after `youtu.be/` or `watch?v=` |
| `NEXT_PUBLIC_FILM_MP4_URL` | Optional. Direct MP4 URL; when set it replaces the YouTube embed |

Add each one to Vercel (you are prompted for the value):

```bash
vercel env add R2_ACCOUNT_ID production
vercel env add R2_ACCESS_KEY_ID production
vercel env add R2_SECRET_ACCESS_KEY production
vercel env add R2_BUCKET production
vercel env add NEXT_PUBLIC_FILM_YOUTUBE_ID production
# optional
vercel env add NEXT_PUBLIC_FILM_MP4_URL production
```

For local development put the same values in `.env.local` (see `.env.example`).

`NEXT_PUBLIC_*` values are baked in at build time, so **redeploy** after adding
or changing the film variables. Without them the page shows a "Film coming soon"
card. Without the `R2_*` variables the page still renders, and uploads fail with
a friendly "not available right now" message.

## 5. Create the database table

```bash
npm run db:uploads
```

Like the other `db:*` scripts this needs `POSTGRES_URL` in the environment
(for example `set -a; source .env.local; set +a` first). It is safe to run more
than once.

## 6. Test it

1. Open `/memories`, pick a photo, and watch it reach "Done".
2. Open `/admin/uploads`: the file is listed under the name you entered, with a
   download link that expires after 15 minutes (reload for a fresh one).

## Bulk download

Install [rclone](https://rclone.org/) and add a remote to `~/.config/rclone/rclone.conf`:

```ini
[r2]
type = s3
provider = Cloudflare
access_key_id = <R2_ACCESS_KEY_ID>
secret_access_key = <R2_SECRET_ACCESS_KEY>
endpoint = https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com
acl = private
no_check_bucket = true
```

Then copy everything down (re-running only fetches new files):

```bash
rclone copy r2:bennyandblue-guest-media ./guest-media --progress
```

## Notes

- **Abuse protection**: `/api/memories/sign` allows 20 requests per minute per IP
  (each request can cover up to 50 files). The limit is in-memory per server
  instance, so it is a speed bump, not a guarantee. The file's type and exact
  size are part of the signed URL, so R2 rejects anything that differs from what
  was validated.
- **Large videos**: each file is one PUT, which R2 caps at about 5 GB. An
  interrupted upload restarts from zero when the guest taps Retry, so very large
  videos need a steady connection.
- **Orphans**: `guest_uploads` is written only after R2 confirms the object
  exists. A file whose upload finished but whose record failed is still in the
  bucket and still comes down with `rclone copy`.

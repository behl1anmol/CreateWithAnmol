# Plan: Server-Side Drive Image Proxy

## Root Cause (Confirmed Empirically)

Browser → `lh3.googleusercontent.com/d/{ID}` → **HTTP 429 Too Many Requests**

Google's "fife" CDN server applies per-origin rate limiting on concurrent browser requests. When 6 card images fire simultaneously, most get 429. No URL format (thumbnail, lh3, uc) avoids this — the 429 is enforced at the CDN level on browser-origin requests.

**Why server-side proxy works:**
- Server requests to Google Drive don't carry browser origin headers
- No per-session concurrency limit applies to server-to-server requests
- Curl tests confirm all formats return 200 from server context

---

## Fix: Next.js Route Handler Proxy

Create `src/app/api/drive-image/route.ts`. Browser requests `/api/drive-image?id={FILE_ID}` → Next.js server fetches from Drive → returns image to browser.

### Security constraint
Validate `id` param strictly before using it in a URL: only `[a-zA-Z0-9_\-]{10,80}` allowed. Drive file IDs are 28-44 alphanumeric chars. Prevents SSRF.

### Caching
Add `Cache-Control: public, max-age=86400` on response. After first load, browser caches each image for 24 hours — subsequent page loads are instant (no server hit).

---

## Files to Change

### 1. NEW — `src/app/api/drive-image/route.ts`

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id || !/^[a-zA-Z0-9_\-]{10,80}$/.test(id)) {
    return new Response('Invalid ID', { status: 400 })
  }

  const driveUrl = `https://drive.google.com/uc?export=view&id=${id}`

  const res = await fetch(driveUrl)

  if (!res.ok) {
    return new Response('Failed to fetch image', { status: res.status })
  }

  const contentType = res.headers.get('content-type') ?? 'image/jpeg'
  const body = await res.arrayBuffer()

  return new Response(body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
```

### 2. EDIT — `src/lib/utils/imageUrl.ts`

Change output URL from `lh3.googleusercontent.com/d/{ID}` → `/api/drive-image?id={ID}`.

Both URL patterns (file/d/{ID} and ?id={ID}) map to same proxy endpoint.

### 3. NOT CHANGED
- `next.config.ts` — no new remote patterns needed (proxy is same-origin)
- `*Client.tsx` files — `<img src>` receives pre-transformed URLs, unchanged
- `normalize.ts` — unchanged

---

## Playwright Validation Steps

After implementation:
1. Start dev server: `npm run dev`
2. Run Playwright script that opens `localhost:3000/prompts`
3. Wait for all `<article>` img elements to load (check `naturalHeight > 0`)
4. Assert: all 6 images load (no 429, no blank cards)
5. Also verify `/products` and `/blogs` — same proxy is used there

---

## Docs to Update After Implementation

- `.claude/context/content-model.md` — Image Rules: note proxy approach, remove reference to lh3 CDN format
- `.claude/analysis/debugging-log.md` — document 429 root cause + proxy fix
- `.claude/analysis/implementation-notes.md` — session entry
- `.claude/analysis/architectural-decisions.md` — decision: server proxy for Drive images

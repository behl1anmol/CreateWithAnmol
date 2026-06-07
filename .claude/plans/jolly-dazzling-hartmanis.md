# Plan: PR #1 Comment Fixes — Bugs, Security, Performance, Hygiene

## Context

PR #1 review comment (#4561943827) identified 4 code issues + 2 repo hygiene items
in `drive-image/route.ts` and `SearchClient.tsx`. One item (SearchClient cleanup)
was already fixed in commit `f610040`. The remaining 5 items need addressing on
branch `pr-bugfix-performance-improvement`.

---

## Pre-Analysis: What's Already Fixed

**SearchClient.tsx — debounce cleanup** → DONE in `f610040`.
Cleanup fn at lines 187-190 already has both `clearTimeout` and `abortRef.current?.abort()`.
No action needed.

---

## Changes Required

### 1. `src/app/api/drive-image/route.ts` — 3 fixes in one file

**Bug: wrong upstream URL (line 9)**
- Current: `https://drive.google.com/uc?export=view&id=${id}`
- Fix: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`
- Rationale: `uc?export=view` triggers virus-scan redirect for large files and is
  increasingly rate-limited. `thumbnail` endpoint returns image binary directly,
  no redirect. `sz=w1000` = 1000px wide, adequate for web display.

**Security: no content-type validation (lines 17-24)**
- Current: forwards whatever Drive returns, including `text/html`
- Fix: reject responses where `content-type` doesn't start with `image/`
- Also add `X-Content-Type-Options: nosniff` and `Content-Security-Policy: default-src 'none'`
- Rationale: crafted Drive file returning `text/html` with inline script would execute
  under origin. Defense-in-depth even though thumbnail URL reduces risk.
- Remove `?? 'image/jpeg'` fallback — if Drive returns no content-type, we cannot
  safely forward it; fail closed with 400.

**Performance: arrayBuffer() buffers entire image (line 18)**
- Current: `const body = await res.arrayBuffer()` then `new Response(body, ...)`
- Fix: `new Response(res.body, ...)` — stream directly
- Rationale: Cloudflare Workers 128 MB memory limit. Buffering raw image wastes
  memory unnecessarily. `res.body` is a `ReadableStream` in both Node and Edge runtimes.

**Combined final route:**
```ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id || !/^[a-zA-Z0-9_\-]{10,80}$/.test(id)) {
    return new Response('Invalid ID', { status: 400 })
  }

  const driveUrl = `https://drive.google.com/thumbnail?id=${id}&sz=w1000`
  const res = await fetch(driveUrl)

  if (!res.ok) {
    return new Response('Failed to fetch image', { status: res.status })
  }

  const contentType = res.headers.get('content-type') ?? ''

  if (!contentType.startsWith('image/')) {
    return new Response('Not an image', { status: 400 })
  }

  return new Response(res.body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'",
    },
  })
}
```

---

### 2. `.gitignore` — hygiene

Add two entries:
```
test-results/
/.claude/plans/
```

Then untrack already-committed files:
```bash
git rm --cached test-results/.last-run.json
git rm --cached ".claude/plans/"  # (15 files tracked)
```

These files are AI planning artifacts and Playwright run state — not source.

---

### 3. `.claude/analysis/` — documentation updates

After changes, append to:
- `lessons-learned.md` — lessons from this fix session
- `debugging-log.md` — what was found and fixed
- `session-handoff.md` — current branch state summary

---

## Verification

1. **Build check**: `npm run build` — ensure no TS errors
2. **Playwright**: run `npx playwright test` — verify search and image loading
3. **Manual**: start dev server, load a page with Drive images, confirm they render
4. **Security check**: verify `X-Content-Type-Options` and CSP headers present in
   response from `/api/drive-image?id=<valid-id>`
5. **Git hygiene**: `git ls-files test-results/ .claude/plans/` should return empty

---

## Files Modified

| File | Change |
|------|--------|
| `src/app/api/drive-image/route.ts` | URL bug, security, streaming perf |
| `.gitignore` | Add test-results/, /.claude/plans/ |
| `.claude/analysis/lessons-learned.md` | Append session lessons |
| `.claude/analysis/debugging-log.md` | Append fix log |
| `.claude/analysis/session-handoff.md` | Append handoff note |

**Untrack from git index (not modify):**
- `test-results/.last-run.json`
- `.claude/plans/` (15 files)

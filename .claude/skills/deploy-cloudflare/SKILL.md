---
name: deploy-cloudflare
description: |
  Step-by-step deployment guide for the Create with Anmol website on Cloudflare Pages using @opennextjs/cloudflare.
  Covers first-time project setup, environment variables, build commands, ISR configuration, and redeployment.
  Use when asked to deploy, publish, ship, or push the site to Cloudflare Pages, or troubleshoot deployment issues.
---

# Cloudflare Pages Deployment Guide — Create with Anmol

**Stack:** Next.js 16 + `@opennextjs/cloudflare` + Cloudflare Pages (Workers runtime)
**Adapter:** `@opennextjs/cloudflare` — NOT `@cloudflare/next-on-pages` (blocked by Next.js 16 peer dep)
**ISR:** `revalidate = 3600` on all content routes — sheet updates go live within 1 hour without redeployment

---

## Prerequisites

- Cloudflare account at dash.cloudflare.com
- Node.js ≥22 on local machine (required for `wrangler dev` local preview; build works on Node 20)
- Project dependencies installed: `npm install`
- `.env.local` present at project root with `APPS_SCRIPT_URL`

---

## Part 1 — One-Time Cloudflare Pages Setup

### Step 1.1 — Connect GitHub Repository

1. Go to **Cloudflare Dashboard → Workers & Pages → Create**
2. Select **Pages** tab → **Connect to Git**
3. Authorize GitHub if prompted
4. Select the `CreateWithAnmol` repository
5. Click **Begin setup**

### Step 1.2 — Configure Build Settings

In the "Set up builds and deployments" screen, set:

| Setting | Value |
|---------|-------|
| **Framework preset** | None (do not select Next.js preset — it defaults to wrong adapter) |
| **Build command** | `npm run deploy` |
| **Build output directory** | `.open-next/assets` |
| **Root directory** | `/` (leave default) |
| **Node.js version** | `22.x` (set under Settings → Build → Environment) |

> **Why `npm run deploy`?** This runs `opennextjs-cloudflare build && opennextjs-cloudflare deploy` — builds the Next.js app, transforms it for Workers runtime, and uploads. The Cloudflare Pages build environment handles the deploy step automatically when triggered via Git.

> **Alternative:** If deploying via CLI instead of Git integration, set build command to `npm run build` only and run `npm run deploy` locally. See Part 3.

### Step 1.3 — Set Environment Variables

Go to **Settings → Environment Variables** in your Pages project. Add for **both Production and Preview**:

| Variable | Value |
|----------|-------|
| `APPS_SCRIPT_URL` | `https://script.google.com/macros/s/AKfycbxDKNTVNysBLTP8Qpc1GxCHnQfcL4_hOtXnu2p7cMqGDN8ADqAVaPwSae6j6xDH68UJ/exec` |

> **Critical:** This variable has NO `NEXT_PUBLIC_` prefix. It is server-side only. If you accidentally use `NEXT_PUBLIC_APPS_SCRIPT_URL`, the fetch layer will crash with `APPS_SCRIPT_URL environment variable is not set`.

### Step 1.4 — Trigger First Deployment

Push to `main` branch OR click **Save and Deploy** in the Pages UI. Cloudflare will run the build command and deploy.

---

## Part 2 — Verify Deployment

### Check Build Log
In **Pages → Deployments → [latest deployment] → Build Log**, look for:

```
OpenNext build complete.
Worker saved in `.open-next/worker.js`
```

And confirm route table shows ISR:
```
Route (app)      Revalidate  Expire
┌ ○ /                    1h      1y
├ ○ /blogs               1h      1y
├ ○ /products            1h      1y
└ ○ /prompts             1h      1y
```

If `Revalidate` column is missing, `export const revalidate = 3600` is absent from a page file. Check `src/app/page.tsx`, `src/app/prompts/page.tsx`, `src/app/products/page.tsx`, `src/app/blogs/page.tsx`.

### Check Live Site
Visit your Pages URL (e.g., `https://createwithanmol.pages.dev`):

- [ ] Home page loads — product/blog/prompt cards show real content (not mock data)
- [ ] `/prompts` grid renders, category filter pills work
- [ ] `/products` featured hero renders, grid renders
- [ ] `/blogs` featured blog hero renders, grid renders
- [ ] No blank sections on home page (if blank, check `APPS_SCRIPT_URL` is set)

---

## Part 3 — Deploy From CLI (Alternative to Git Integration)

Use when you want to deploy without pushing to GitHub (e.g., testing a branch).

```bash
# 1. Build locally
npm run build        # runs next build — validates TypeScript

# 2. Build + deploy to Cloudflare
npm run deploy       # runs opennextjs-cloudflare build && opennextjs-cloudflare deploy
```

> **Node version requirement:** `npm run deploy` calls `wrangler`, which requires Node ≥22.
> On Node 20: run `nvm use 22` first, or use `volta pin node@22`.

To upload without deploying (useful for staged rollouts):
```bash
npm run upload       # opennextjs-cloudflare build && opennextjs-cloudflare upload
```

---

## Part 4 — Local Cloudflare Workers Preview

Runs the app in a local Workers runtime (matches production environment exactly):

```bash
npm run preview      # opennextjs-cloudflare build && opennextjs-cloudflare preview
```

> Requires Node ≥22 for wrangler dev server. On Node 20 this will fail.
> `npm run dev` (standard Next.js dev server, Node.js runtime) still works on Node 20 for development.

**Environment variables for local preview:**
`.dev.vars` at project root is used by wrangler (not `.env.local`). Current contents:
```
NEXTJS_ENV=development
APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
```

---

## Part 5 — Redeployment (Content or Code Updates)

### Code changes → redeploy
Push to `main` → Cloudflare Pages auto-triggers build + deploy via Git integration.

### Google Sheet content update → NO redeploy needed
ISR handles it. After editing the sheet, content goes live on next request after 1-hour cache expires. Maximum wait: 60 minutes.

### Force immediate cache bust (if ISR wait unacceptable)
Option A — trigger a new deployment (clears all cached pages):
```bash
npm run deploy
```
Option B — use Cloudflare dashboard:
**Pages → Deployments → Retry deployment** on latest build.

---

## Part 6 — Key Files Reference

| File | Purpose |
|------|---------|
| `wrangler.jsonc` | Cloudflare Workers config — `main`, `compatibility_flags`, `assets` binding |
| `open-next.config.ts` | OpenNext adapter config — R2 cache commented out (use for persistent ISR if needed) |
| `.dev.vars` | Local wrangler env vars — gitignored, mirrors `.env.local` for Workers runtime |
| `public/_headers` | HTTP security headers for static assets |
| `src/lib/api/client.ts` | `fetchFromCMS()` — reads `APPS_SCRIPT_URL` from `process.env` |

---

## Part 7 — Troubleshooting

### "APPS_SCRIPT_URL environment variable is not set"
- **Build error:** Env var not set in Cloudflare Pages → Settings → Environment Variables
- **Local error:** `.env.local` missing or `APPS_SCRIPT_URL` typo'd

### Home page shows blank product/blog/prompt sections
- Apps Script fetch returning empty array. Check build log for `CMS fetch failed` lines.
- Verify Apps Script is deployed as Web App ("Execute as Me", "Anyone can access")
- Test URL directly: `curl "APPS_SCRIPT_URL?path=products"` → should return `{"data":[...]}`

### Category filters not working after deployment
- `[Name]Client.tsx` components accidentally lost `'use client'` directive
- Check `src/app/prompts/PromptsClient.tsx`, `ProductsClient.tsx`, `BlogsClient.tsx` — all must have `'use client'` as first line

### Build fails with "Cannot find module '@/lib/api'"
- `src/lib/api/index.ts` missing or path alias broken
- Verify `tsconfig.json` has `"@/*": ["./src/*"]` in `paths`

### `wrangler: command not found` during local deploy
- wrangler installed as devDep — use `npx wrangler` or `npm run deploy` (script uses npx internally)

### ISR not working — content never updates
- Verify `export const revalidate = 3600` is in ALL page files: `page.tsx` for `/`, `/prompts`, `/products`, `/blogs`
- R2 cache not configured (default Worker memory cache) — see `open-next.config.ts` to enable R2 for persistent cross-instance caching

### `@cloudflare/next-on-pages` peer dep error
- Do NOT use this adapter on this project. It caps at Next.js 15. Use `@opennextjs/cloudflare` only.

---

## Part 8 — Cloudflare Pages Dashboard Checklist (One-Time)

- [ ] Build command: `npm run deploy`
- [ ] Build output directory: `.open-next/assets`
- [ ] Node.js version: `22.x`
- [ ] Environment variable `APPS_SCRIPT_URL` set for **Production**
- [ ] Environment variable `APPS_SCRIPT_URL` set for **Preview**
- [ ] Custom domain configured (if using custom domain, not `.pages.dev`)

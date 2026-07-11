# Production Deployment — Step by Step

Deploy NeuralHub on **$0/month** free tiers:

| Service | Free tier | Purpose |
|---------|-----------|---------|
| [Vercel](https://vercel.com) | Hobby | Hosting, SSL, cron |
| [Neon](https://neon.tech) | Free | PostgreSQL database |
| [Supabase](https://supabase.com) | Free | Image uploads (media bucket) |
| [Resend](https://resend.com) | Free (3k/mo) | Transactional email |

Optional: Google/GitHub OAuth, Google Analytics, Microsoft Clarity (all free).

---

## Overview

```
1. Neon database     → connection string
2. Supabase storage  → media bucket
3. Resend email      → API key
4. GitHub repo       → push code
5. Vercel project    → env vars + deploy
6. Run migrations    → schema + seed
7. Verify + promote admin
```

---

## Step 1 — Create the Neon database

1. Sign up at [neon.tech](https://neon.tech).
2. Create a project (e.g. `neuralhub-prod`).
3. Open **Dashboard → Connection details**.
4. Copy the connection string with the **direct** host (no `-pooler`):

   ```
   postgresql://user:pass@ep-xxx.region.aws.neon.tech/neuralhub?sslmode=require
   ```

5. Save this as `DIRECT_DATABASE_URL` — you will paste it into Vercel later.

> **Tip:** Neon free tier sleeps after inactivity. The first request after sleep may take 1–2 seconds (cold start). This is normal.

---

## Step 2 — Create Supabase storage (image uploads)

Production **requires** Supabase for uploads (local `public/uploads` only works in dev).

1. Sign up at [supabase.com](https://supabase.com).
2. Create a project.
3. Go to **Storage → New bucket**:
   - Name: `media`
   - Public bucket: **Yes**
4. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

---

## Step 3 — Set up Resend (email)

1. Sign up at [resend.com](https://resend.com).
2. Add and verify a domain (or use Resend's test domain for initial testing).
3. Create an API key → `RESEND_API_KEY`.
4. Set `EMAIL_FROM` to a verified sender, e.g. `NeuralHub <noreply@yourdomain.com>`.

Without Resend, registration verification and password reset emails will not send.

---

## Step 4 — Generate secrets

Run locally (Git Bash, WSL, or PowerShell):

```bash
# AUTH_SECRET (min 32 chars)
openssl rand -base64 32

# CRON_SECRET (for scheduled publish cron)
openssl rand -base64 32
```

Save both — you will add them to Vercel.

---

## Step 5 — Push code to GitHub

If you haven't already:

```bash
cd "c:\Neural Hub"
git add .
git commit -m "Prepare for production deployment"
git branch -M main

# Create repo (replace with your GitHub username)
gh repo create neuralhub --public --source=. --remote=origin --push
```

Or create the repo manually on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/neuralhub.git
git push -u origin main
```

---

## Step 6 — Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. **Import** your GitHub `neuralhub` repository.
3. Framework preset: **Next.js** (auto-detected).
4. Under **Build & Development Settings**, confirm:
   - **Root Directory:** leave empty
   - **Build Command:** leave empty (uses `npm run build` from `package.json`)
   - **Output Directory:** leave **completely empty** — do not type `(default)`, `.`, or `.next`
   - **Install Command:** leave empty (uses `npm install`)
5. **Do not deploy yet** — open **Environment Variables** first.

### Required environment variables

Add these for **Production** (and Preview if you want preview deploys to work):

| Variable | Value |
|----------|-------|
| `DIRECT_DATABASE_URL` | Neon direct connection string (Step 1) |
| `AUTH_SECRET` | Output from `openssl rand -base64 32` |
| `AUTH_URL` | `https://YOUR_PROJECT.vercel.app` (or custom domain) |
| `NEXT_PUBLIC_APP_URL` | Same as `AUTH_URL` |
| `CRON_SECRET` | Output from second `openssl rand -base64 32` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | `NeuralHub <noreply@yourdomain.com>` |
| `TRUST_PROXY` | `true` |
| `NODE_ENV` | `production` (Vercel sets this automatically) |

### Recommended (enable when ready)

| Variable | Purpose |
|----------|---------|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Microsoft Clarity (free heatmaps) |

### Optional features

| Variable | Enables |
|----------|---------|
| `AI_ENABLED=true` + `AI_PROVIDER=openai` + `OPENAI_API_KEY` | AI assists (costs $) |
| `NEXT_PUBLIC_ADS_ENABLED=true` + AdSense IDs | Ads |
| `SEARCH_PROVIDER=hybrid` | FTS + vector search (needs OpenAI for embeddings) |

6. Click **Deploy**.

Vercel runs `npm run build` automatically (`prisma generate` via `postinstall` and in the build script).

---

## Step 7 — Run database migrations

Migrations **do not** run during the Vercel build. Run once after first deploy.

### Option A — From your machine (easiest)

```bash
# Point at production Neon DB
set DIRECT_DATABASE_URL=postgresql://...your-neon-direct-url...
npm run deploy:migrate
npm run db:seed
npm run db:backfill-search
```

PowerShell:

```powershell
$env:DIRECT_DATABASE_URL="postgresql://..."
npm run deploy:migrate
npm run db:seed
npm run db:backfill-search
```

### Option B — Preflight check first

```bash
set NODE_ENV=production
set DIRECT_DATABASE_URL=postgresql://...
set AUTH_SECRET=your-32-char-secret
set CRON_SECRET=your-cron-secret
set NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
set AUTH_URL=https://your-app.vercel.app
set NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
set SUPABASE_SERVICE_ROLE_KEY=your-key
npm run deploy:preflight
```

---

## Step 8 — Configure OAuth (optional)

### Google

1. [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials.
2. Create **OAuth 2.0 Client ID** (Web application).
3. Authorized redirect URI:
   ```
   https://YOUR_DOMAIN/api/auth/callback/google
   ```
4. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to Vercel → Redeploy.

### GitHub

1. GitHub → Settings → Developer settings → OAuth Apps → New.
2. Authorization callback URL:
   ```
   https://YOUR_DOMAIN/api/auth/callback/github
   ```
3. Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to Vercel → Redeploy.

---

## Step 9 — Verify deployment

```bash
curl https://YOUR_DOMAIN/api/health
# Expected: {"status":"ok","database":"connected"}
```

Manual checklist:

- [ ] Homepage loads
- [ ] Register → verify email (check inbox)
- [ ] Login works
- [ ] Create article + upload cover image
- [ ] Search returns results
- [ ] Newsletter subscribe sends confirmation

### Promote yourself to admin

In Neon SQL Editor (or any Postgres client):

```sql
UPDATE "User" SET role = 'EDITOR' WHERE email = 'you@example.com';
-- ADMIN for full access to users/settings/security
```

Then visit `https://YOUR_DOMAIN/admin`.

---

## Step 10 — Cron (scheduled publishing)

`vercel.json` configures a **daily** cron job (required for Vercel **Hobby / free** tier):

```
0 12 * * *   → once per day at 12:00 UTC
GET /api/cron/publish-scheduled
Authorization: Bearer <CRON_SECRET>
```

- Ensure `CRON_SECRET` is set in Vercel production env.
- Hobby accounts are limited to **one cron run per day**. Schedules like `*/15 * * * *` require Vercel Pro.

### Free tier: more frequent publishes (optional)

Use a free external cron (e.g. [cron-job.org](https://cron-job.org)) to call your endpoint every 15 minutes:

```
URL:     https://YOUR_DOMAIN/api/cron/publish-scheduled
Method:  GET
Header:  Authorization: Bearer YOUR_CRON_SECRET
```

Then remove or keep the daily Vercel cron as a backup.

Test manually:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://YOUR_DOMAIN/api/cron/publish-scheduled
```

---

## Monitoring (free tier)

| Layer | Tool | How |
|-------|------|-----|
| Uptime | Vercel | Project dashboard |
| Server errors | Built-in | `server.error` events in `AnalyticsEvent` table |
| Client errors | Built-in | `client.error` events via `/api/errors` |
| Runtime logs | Vercel | Deployments → Functions → Logs |
| Analytics | GA + Clarity | Set env vars (optional) |
| Audit trail | Admin | `/admin/security` (ADMIN role) |

View error events in Neon:

```sql
SELECT * FROM "AnalyticsEvent"
WHERE event IN ('server.error', 'client.error')
ORDER BY "createdAt" DESC LIMIT 20;
```

### Optional: Sentry (free tier)

For richer stack traces, add [Sentry](https://sentry.io) later — not required for launch.

---

## Performance (already configured)

- `next/image` for avatars and covers
- Font `display: swap` (Inter, JetBrains Mono)
- Static asset cache headers (`/_next/static` — 1 year)
- Package import optimization (`lucide-react`, `framer-motion`)
- ISR on `/sitemap.xml` and `/feed.xml` (1 hour)
- Gzip compression enabled

---

## Free tier limits to know

| Service | Limit | Mitigation |
|---------|-------|------------|
| Neon | 0.5 GB storage, compute hours | Fine for early traffic; upgrade when needed |
| Vercel | 100 GB bandwidth/month | Plenty for a content site |
| Supabase | 1 GB storage | Compress images before upload |
| Resend | 3,000 emails/month | Enough for early users |
| Vercel cron | 1 run/day on Hobby | Daily at 12:00 UTC; use cron-job.org for 15-min |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Next.js output directory "(default)" was not found` | Build did not produce `.next`. Scroll **up** in build logs for the real error. Clear **Output Directory** in Vercel settings (leave blank). Set Framework to **Next.js**. Run `npm run deploy:migrate` on Neon so build-time DB queries succeed. Redeploy after pushing latest code. |
| Build fails on Vercel | Check env vars; ensure `CRON_SECRET`, Supabase, `AUTH_SECRET` set |
| `database: disconnected` on /api/health | Wrong `DIRECT_DATABASE_URL`; use non-pooler Neon host |
| Prisma migration errors | Run `npm run deploy:migrate` with direct URL |
| OAuth redirect mismatch | `AUTH_URL` must exactly match production URL |
| Images don't upload | Supabase `media` bucket must exist and be public |
| Emails not sending | Verify Resend domain + `EMAIL_FROM` |
| Cron not running | Confirm `CRON_SECRET` + Vercel Cron tab |
| Cold start slow | Neon free tier wake-up; normal on first hit |

---

## Custom domain (optional)

1. Vercel → Project → **Settings → Domains** → Add domain.
2. Update DNS per Vercel instructions.
3. Update `AUTH_URL` and `NEXT_PUBLIC_APP_URL` to `https://yourdomain.com`.
4. Update OAuth redirect URIs.
5. Redeploy.

---

## Quick reference — deploy commands

```bash
npm run build              # Local production build test
npm run deploy:preflight   # Validate env before deploy
npm run deploy:migrate     # Apply migrations to production DB
npm run db:seed            # Categories + membership tiers
npm run db:backfill-search # Search index for existing articles
```

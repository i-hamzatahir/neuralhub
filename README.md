# NeuralHub

A premium knowledge platform for AI, Data Science, Machine Learning, Programming, and Research — inspired by Medium and Hashnode.

Built with Next.js 16, TypeScript, Tailwind CSS v4, Prisma 7, and PostgreSQL (Neon free tier). **$0/month** infrastructure target.

## Status

**Phases 1–16 complete.** The platform includes auth, publishing, SEO, search, engagement, admin, newsletter, ads, advanced editor, AI hooks, design polish, vector search, affiliate/membership prep, and production hardening.

## Features

| Area | Capabilities |
|------|----------------|
| **Auth** | Email/password, Google/GitHub OAuth, email verification, password reset |
| **Publishing** | TipTap editor, autosave, drafts, review workflow, scheduled publish, preview mode |
| **Editor** | Code highlighting, math (KaTeX), Mermaid, Markdown, tables, callouts, video embeds |
| **Public** | Article reader, TOC, categories, authors, community/projects/tools/resources pages |
| **Search** | Postgres FTS, vector semantic search, hybrid mode (`SEARCH_PROVIDER`) |
| **Engagement** | Comments, likes, bookmarks, follow authors, notifications |
| **Admin** | Articles, users, tags, media, analytics, category CRUD, audit logs, settings |
| **Growth** | Newsletter (double opt-in), AdSense slots, cookie consent, Microsoft Clarity |
| **AI** | Title/excerpt suggestions, auto-summary, auto-tagging, embeddings on publish |
| **Monetization** | Affiliate/sponsored disclosure, membership tier schema (Stripe-ready) |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL via Neon |
| ORM | Prisma 7 |
| Auth | Auth.js v5 |
| Editor | TipTap 3 |
| Icons | Lucide React |
| Validation | Zod |
| Hosting | Vercel (free tier) |

## Prerequisites

- Node.js 20+
- npm 10+
- A free [Neon](https://neon.tech) PostgreSQL database

## Quick start

```bash
git clone <repository-url>
cd neuralhub
npm install
cp .env.example .env
```

Edit `.env` — set at minimum:

```env
DIRECT_DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neuralhub?sslmode=require"
AUTH_SECRET="your-32-char-minimum-secret-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> Use the Neon host **without** `-pooler` for `DIRECT_DATABASE_URL`.

```bash
npm run db:check      # Verify database connection
npm run db:migrate    # Run migrations
npm run db:seed       # Seed categories
npm run dev           # http://localhost:3000
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Prisma generate + production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run db:check` | Test database connectivity |
| `npm run db:migrate` | Run migrations (dev) |
| `npm run db:migrate:deploy` | Deploy migrations (production) |
| `npm run db:seed` | Seed categories and membership tiers |
| `npm run db:backfill-search` | Backfill article search text |
| `npm run db:backfill-embeddings` | Backfill vector embeddings (requires OpenAI) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset database |

Prisma Client is generated automatically via `postinstall`.

## Project structure

```
src/
├── app/
│   ├── (public)/       # Public website
│   ├── (auth)/         # Login, register, verify
│   ├── (dashboard)/    # Author dashboard
│   ├── (admin)/        # Editorial admin panel
│   └── api/            # API routes + cron
├── components/         # UI by feature
├── config/             # Site config, features, ads
├── lib/
│   ├── services/       # Business logic
│   ├── actions/        # Server actions
│   ├── auth/           # Auth.js, policies, audit
│   ├── editor/         # TipTap extensions + nodes
│   └── utils/          # Shared utilities
├── styles/             # Prose typography
└── types/              # TypeScript declarations
prisma/
├── schema.prisma
├── seed.ts
└── migrations/
docs/
├── ARCHITECTURE.md
└── DEPLOYMENT.md
```

## Environment variables

See `.env.example` for the full list. Key groups:

- **Database:** `DIRECT_DATABASE_URL`
- **Auth:** `AUTH_SECRET`, `AUTH_URL`, OAuth client IDs
- **Email:** `RESEND_API_KEY`, `EMAIL_FROM`
- **Search:** `SEARCH_PROVIDER=postgres-fts|vector|hybrid`
- **AI:** `AI_ENABLED`, `AI_PROVIDER`, `OPENAI_API_KEY`
- **Ads:** `NEXT_PUBLIC_ADS_ENABLED`, `NEXT_PUBLIC_ADSENSE_ID`
- **Cron:** `CRON_SECRET`

## Deployment

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for the full step-by-step production guide (Vercel + Neon + Supabase + Resend, free tier).

Quick checklist:

1. Push to GitHub → import in Vercel
2. Set environment variables (see `.env.example`)
3. Deploy → run `npm run deploy:migrate` + `npm run db:seed`
4. Verify `GET /api/health`
5. Promote your user to `EDITOR` in the database

```bash
npm run deploy:preflight   # Validate production env locally
npm run deploy:migrate     # Apply migrations to production DB
```

Cron for scheduled publishing is configured in `vercel.json` (every 15 minutes).

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design, service layer, and data model.

## Admin access

```sql
UPDATE "User" SET role = 'EDITOR' WHERE email = 'you@example.com';
```

- **EDITOR** — `/admin` (articles, comments, newsletter)
- **ADMIN** — users, settings, security logs

## License

Private — All rights reserved.

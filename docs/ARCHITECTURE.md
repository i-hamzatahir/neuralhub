# NeuralHub Architecture

NeuralHub is a modular monolith built on Next.js App Router with server actions, Prisma, and PostgreSQL.

## Route groups

| Group | Path prefix | Auth |
|-------|-------------|------|
| `(public)` | `/`, `/articles`, `/search`, … | Public |
| `(auth)` | `/login`, `/register`, … | Guest-only redirects |
| `(dashboard)` | `/dashboard/*` | AUTHOR+ |
| `(admin)` | `/admin/*` | EDITOR+ (ADMIN for users/settings/security) |

Middleware (`src/middleware.ts`) enforces RBAC via `src/lib/auth/policies.ts`.

## Service layer

Business logic lives in `src/lib/services/`:

| Service | Responsibility |
|---------|----------------|
| `articles/` | CRUD, publishing, search text, reading time |
| `search/` | Postgres FTS provider (vector stub for future) |
| `engagement/` | Comments, likes, bookmarks, follows, notifications |
| `admin/` | Review queue, audit logs, site settings, cron publish |
| `newsletter/` | Double opt-in subscribe, unsubscribe |
| `ai/` | Provider abstraction (none, openai) |
| `analytics/` | Event tracking, rate-limit cleanup |
| `settings/` | User preferences |

Server actions in `src/lib/actions/` are thin wrappers calling services.

## Content pipeline

Articles store TipTap JSON in `Article.content` with `contentFormat: "json"`.

Custom editor nodes: math (KaTeX), Mermaid diagrams, Markdown blocks.

Reader renders via read-only TipTap (`article-content.tsx`). Utilities extract text for search, reading time, and TOC.

## Data model highlights

- **Auth:** Auth.js v5 with Prisma adapter
- **Roles:** USER → AUTHOR → EDITOR → ADMIN
- **Article statuses:** DRAFT → REVIEW → PUBLISHED → ARCHIVED
- **Audit:** `AuditLog` for auth, admin, and author article events
- **Rate limits:** `RateLimitEntry` table, purged by cron

## External integrations

| Integration | Purpose | Fallback |
|-------------|---------|----------|
| Neon PostgreSQL | Primary database | — |
| Resend | Email | Console log in dev |
| Supabase Storage | Image uploads | Local `public/uploads/` |
| Google Analytics | Page views | Disabled if unset |
| Google AdSense | Monetization | Disabled by default |
| OpenAI | AI assists | Disabled by default |

## Completed phases

1. **Foundation** — Schema, tooling, layout
2. **Auth & publishing** — Auth.js, dashboard, TipTap editor
3. **Public experience** — Reader, categories, trust pages
4. **Search** — Postgres FTS + `/search` UI
5. **Engagement** — Comments, likes, bookmarks, follows, notifications
6. **Admin** — Review queue, roles, audit logs, scheduled publish
7. **Growth** — Newsletter, AdSense slots
8. **Advanced editor** — Math, Mermaid, Markdown blocks + AI hooks
9. **Hardening** — Env validation, security headers, health check, docs

## Key API routes

| Route | Purpose |
|-------|---------|
| `GET /api/health` | Liveness + DB check |
| `GET /api/search` | Full-text search |
| `GET /api/cron/publish-scheduled` | Scheduled articles + cleanup |
| `GET /api/newsletter/unsubscribe` | Token unsubscribe |
| `POST /api/upload` | Author image uploads |

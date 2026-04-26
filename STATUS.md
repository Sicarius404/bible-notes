# Bible Notes App — Project Status

**Last updated:** April 26, 2026  
**Phase:** Phase A (Web App) — Complete, needs testing  
**Next phase:** Phase B (Mobile App — Expo SDK 55)

---

## Quick Start

```bash
cd /home/ziel/development/ai_testing/bible-notes

# 1. Install dependencies & build shared packages
pnpm install
pnpm --filter @bible-notes/shared build
pnpm --filter @bible-notes/pocketbase-client build

# 2. Start PocketBase (first run creates admin)
cd server
./pocketbase serve --http=0.0.0.0:8090
# Open http://localhost:8090/_/ to create admin account

# 3. Start the web app (in another terminal)
cd /home/ziel/development/ai_testing/bible-notes
pnpm --filter @bible-notes/web dev
# Open http://localhost:3000

# 4. Create .env from example
cp .env.example .env
```

---

## Tech Stack (Verified LTS Versions — April 2026)

| Technology | Version | Status |
|---|---|---|
| Node.js | v24.x LTS (Krypton) | Active LTS |
| Next.js | v16.2.x | Active LTS |
| React | v19.2.x | Stable |
| React Native | v0.83.x | Active (for Phase B) |
| Expo SDK | v55 | Stable |
| PocketBase | v0.37.2 | Latest |
| PocketBase JS SDK | v0.26.8 | Latest |
| TypeScript | v6.0.3 | Stable |
| Nginx | v1.30 | Stable |
| Turborepo | v2.9.x | Stable |
| Tailwind CSS | v4 | Latest |
| shadcn/ui | Latest | Component library |
| TanStack Query | v5 | Server state |
| React Hook Form + Zod | Latest | Forms + validation |
| date-fns | Latest | Date handling |
| Lucide React | Latest | Icons |

---

## Project Structure

```
bible-notes/
├── apps/
│   ├── web/                        # Next.js 16 web app ✅
│   └── mobile/                      # Expo SDK 55 (Phase B — not started)
├── packages/
│   ├── shared/                      # Types, constants, verse parser ✅
│   └── pocketbase-client/           # API wrapper for all CRUD ✅
├── server/
│   ├── pb_migrations/               # Schema migration ✅
│   ├── hooks/                       # JSVM hooks (auto user_id) ✅
│   └── seed/reading-plans/           # 4 seed plans ✅
├── scripts/                         # setup.sh, backup.sh, restore.sh ✅
├── nginx/nginx.conf                 # Reverse proxy config ✅
├── docker-compose.yml               # Production deployment ✅
├── docker-compose.dev.yml           # Dev overrides ✅
├── Dockerfile.web                  # Next.js production build ✅
├── PLAN.md                         # Full implementation plan ✅
├── STATUS.md                       # This file ✅
└── Root configs                     # turbo.json, tsconfig, .gitignore, etc. ✅
```

---

## What's Built (Phase A — Web App)

### Shared Packages
- **`@bible-notes/shared`**: TypeScript types for all 6 data models, constants (Bible Gateway URL, service types, nav items), verse parser with regex for all 66 books + abbreviations, `linkifyVerses()` with XSS protection, `verseToUrl()`, `extractVerseRefs()`
- **`@bible-notes/pocketbase-client`**: Full CRUD for all 6 collections, auth (login/signup/logout), `escapeFilterValue()` for injection-safe filter queries, `getAllCampuses()`, `getAllPastors()`, reading plan progress tracking, seed data import

### PocketBase
- **Migration** (`001_init_collections.js`): Creates `users` (auth), `bible_notes`, `small_group_notes`, `sermons`, `reading_plans`, `reading_plan_progress`, `revelations` collections with proper fields, indexes, and API rules
- **Hooks** (`main.pb.js`): `onRecordCreateRequest` hooks on all 6 collections to auto-populate `user_id` from authenticated user
- **Seed data**: 4 reading plans (90, 180, 365 days + NT 30 days)

### Web App (Next.js 16)
- **Auth**: Login, signup, password reset pages with PocketBase auth
- **Middleware**: Auth check redirecting to `/login` if no `pb_auth` cookie
- **PocketBase Provider**: React context syncing auth state + cookie for middleware
- **Home Dashboard**: Quick actions, recent notes/sermons/revelations, reading plan progress
- **Bible Notes**: List with verse/date/search filters, create with verse input + auto-detect, view/edit with verse auto-linking to Bible Gateway, delete with confirmation
- **Small Groups**: List with topic/date/search filters, create, view/edit with verse linking, delete
- **Sermons**: List with pastor/campus/service_type/date/search filters, create with campus autocomplete + pastor autocomplete + morning/evening toggle, view/edit, delete
- **Reading Plans**: List with progress bars, preset plan import dialog, custom plan builder, day-by-day progress with checkmarks, delete
- **Revelations**: Quick-jot input at top, inline edit, search/filter, delete with confirmation
- **UI Components**: shadcn/ui (button, input, card, badge, textarea, label, dialog, select, tabs, toggle, toggle-group), verse-badge, verse-input, campus-input, pastor-input

### Infrastructure
- **Docker Compose**: PocketBase + Next.js + Nginx for production
- **Nginx**: Reverse proxy with rate limiting, HTTPS support, security headers
- **Scripts**: setup.sh (auto-setup), backup.sh (cron-ready with rotation), restore.sh (with safety backup)
- **Dockerfile.web**: Multi-stage Next.js production build

---

## Bugs Fixed (Session 2)

### Build Errors
- ✅ Added `@types/node` to pocketbase-client (TS error: `process` not found)
- ✅ Fixed `pb.authStore.recordId` → `pb.authStore.record?.id` (correct PB SDK API)

### P0 — Record creation broken (user_id missing)
- ✅ PocketBase hooks (`onRecordCreateRequest`) auto-populate `user_id` from `e.auth.id`
- ✅ Client-side create functions also send `user_id: pb.authStore.record?.id` as belt-and-suspenders

### P1 — Auth cookie mismatch (middleware vs client)
- ✅ `pocketbase-provider.tsx` now syncs `pb_auth` cookie on every auth state change

### P1 — XSS via `dangerouslySetInnerHTML`
- ✅ `linkifyVerses()` now calls `escapeHtml()` on input before replacing verse refs with `<a>` tags

### P1 — Docker PocketBase URL misconfigured for browsers
- ✅ `NEXT_PUBLIC_POCKETBASE_URL` changed from internal Docker hostname to `/api` (proxied through Nginx)
- ✅ `.env.example` documents SSR vs browser URL distinction

### P2 — Filter injection
- ✅ All filter values wrapped in `escapeFilterValue()` across all 5 API modules

### PocketBase Migration & Hooks
- ✅ Migration: `$app.save()`/`$app.delete()` → `app.save()`/`app.delete()` (correct v0.37.x API)
- ✅ Migration: Removed `/// <reference path="../pb_data/types.d.ts" />` directive
- ✅ Hooks: Rewrote using `onRecordCreateRequest()` (correct v0.37.x API, not the old `routerBefore`)
- ✅ Deleted `server/pb_migrations/types.d.ts` (was being run as a migration)
- ✅ Setup script: Fixed `$!` unbound variable with `set -u`

---

## Known Issues / TODO

### Needs Testing
- [ ] Full end-to-end test of the web app (signup → create notes → search → edit → delete)
- [ ] Verify verse auto-linking renders correctly in browser
- [ ] Verify campus/pastor autocomplete works
- [ ] Verify reading plan progress checkmarks work
- [ ] Verify cookie-based auth middleware works with Next.js SSR
- [ ] Test backup/restore scripts

### Needs Implementation
- [ ] **Mobile app (Phase B)**: Expo SDK 55 with React Native 0.83, Expo Router v5, bottom tab navigator, all 6 tabs sharing `@bible-notes/pocketbase-client`
- [ ] **Git init**: Initialize git repo and make first commit
- [ ] **pnpm approve-builds**: Run `pnpm approve-builds` to approve sharp build script
- [ ] **Production deployment**: Set up HTTPS certs with certbot, configure domain

### Potential Improvements
- [ ] Add password reset flow UI (backend endpoint exists via PocketBase)
- [ ] Add offline support / PWA for the web app
- [ ] Add dark mode toggle
- [ ] Add export/import for notes (JSON/CSV)
- [ ] Add share-to-app intent for mobile
- [ ] Add local notification reminders for reading plans

---

## Key Files Reference

| Purpose | File |
|---|---|
| **Implementation Plan** | `PLAN.md` |
| **This Status File** | `STATUS.md` |
| **PocketBase Migration** | `server/pb_migrations/001_init_collections.js` |
| **PocketBase Hooks** | `server/hooks/main.pb.js` |
| **Reading Plan Seeds** | `server/seed/reading-plans/*.json` |
| **Shared Types** | `packages/shared/src/types.ts` |
| **Verse Parser** | `packages/shared/src/verse-parser.ts` |
| **PB Client (CRUD)** | `packages/pocketbase-client/src/*.ts` |
| **Auth Provider** | `apps/web/src/components/pocketbase-provider.tsx` |
| **Auth Middleware** | `apps/web/src/middleware.ts` |
| **App Layout** | `apps/web/src/app/(app)/layout.tsx` |
| **Docker Compose** | `docker-compose.yml` |
| **Nginx Config** | `nginx/nginx.conf` |
| **Setup Script** | `scripts/setup.sh` |
| **Backup Script** | `scripts/backup.sh` |
| **Restore Script** | `scripts/restore.sh` |

---

## PocketBase Admin

After running `./scripts/setup.sh` or starting PocketBase manually:
1. Open `http://localhost:8090/_/`
2. Create your admin account
3. The migration auto-creates all collections
4. The hooks auto-populate `user_id` on record creation

---

## Docker Production Deployment

```bash
# Build and deploy
docker compose up -d

# Create PocketBase admin
docker compose exec pocketbase /pocketbase superuser upsert EMAIL PASS

# Set up HTTPS (first time)
# Edit nginx/nginx.conf and nginx/certs/ with your SSL certs
# Or use certbot: certbot certonly --webroot -w /var/www/certbot -d yourdomain.com

# Backup
./scripts/backup.sh

# Restore
./scripts/restore.sh backups/bible-notes-YYYYMMDD_HHMMSS.zip
```
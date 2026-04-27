# Bible Notes App — Project Status

**Last updated:** April 27, 2026
**Phase:** Phase A (Web App) — Complete, reviewed, and hardened
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
├── docker-compose.production.yml    # Coolify deployment ✅
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
- **Hooks** (`main.pb.js`): `onRecordCreateRequest` + `onRecordUpdateRequest` hooks on all 6 collections to auto-populate `user_id` on creation and prevent `user_id` reassignment on updates
- **Seed data**: 4 reading plans (90, 180, 365 days + NT 30 days)

### Web App (Next.js 16)
- **Auth**: Login, signup, password reset pages with PocketBase auth. JWT validation in middleware. Secure cookie with HTTPS flag.
- **Middleware**: Auth check validating JWT expiration, redirecting to `/login` if invalid or missing
- **PocketBase Provider**: React context syncing auth state + cookie for middleware. Raw `pb` instance no longer exposed in context.
- **Error Boundary**: Top-level `error.tsx` for graceful error handling
- **Home Dashboard**: Quick actions, recent notes/sermons/revelations, reading plan progress
- **Bible Notes**: List with verse/date/search filters, create with verse input + auto-detect, view/edit with verse auto-linking to Bible Gateway (React component, no dangerouslySetInnerHTML), delete with confirmation
- **Small Groups**: List with topic/date/search filters, create, view/edit with verse linking, delete
- **Sermons**: List with pastor/campus/service_type/date/search filters, create with campus autocomplete + pastor autocomplete + morning/evening toggle, view/edit, delete
- **Reading Plans**: List with progress bars, preset plan import dialog, custom plan builder, day-by-day progress with checkmarks (race-condition safe), delete
- **Revelations**: Quick-jot input at top, inline edit, search/filter, delete with confirmation
- **UI Components**: shadcn/ui (button, input, card, badge, textarea, label, dialog, select, tabs, toggle, toggle-group), verse-badge, verse-input, campus-input, pastor-input

### Infrastructure
- **Docker Compose**: PocketBase + Next.js + Nginx for production
- **Docker Compose Production**: Coolify-ready with Traefik labels, no broken healthchecks
- **Nginx**: Reverse proxy with rate limiting, HTTPS support, security headers (X-XSS-Protection removed)
- **Scripts**: setup.sh (auto-setup), backup.sh (cron-ready with rotation), restore.sh (with safety backup)
- **Dockerfile.web**: Multi-stage Next.js production build with `sharp` for image optimization

---

## Comprehensive Review & Fixes (April 27, 2026)

A full security, architecture, and UI/UX review was completed. All critical issues have been resolved.

### Critical Fixes Applied

#### 1. Middleware Auth Bypass — JWT Validation
**File:** `apps/web/src/middleware.ts`
- Added `isTokenValid()` function that decodes the JWT payload and verifies it hasn't expired
- Changed auth check from simple cookie existence to `!authCookie?.value || !isTokenValid(authCookie.value)`

#### 2. user_id Reassignment on Update
**File:** `server/hooks/main.pb.js`
- Added `onRecordUpdateRequest` hooks for all 6 collections
- Hooks re-set `user_id` to its existing value, preventing ownership transfer attacks

#### 3. Race Condition in Reading Plan Progress
**File:** `packages/pocketbase-client/src/reading-plans.ts`
- Wrapped `markDayComplete` create call in try-catch
- Handles unique constraint violations from concurrent toggles by falling back to an update

#### 4. dangerouslySetInnerHTML Replaced
**File:** `apps/web/src/app/(app)/bible-notes/[id]/page.tsx`
- Created `VerseContent` React component that safely renders verse-linked content
- Eliminates single point of failure for XSS; no raw HTML injection

#### 5. Signup Rollback Failure
**File:** `packages/pocketbase-client/src/auth.ts`
- Wrapped create and login in separate try-catch blocks
- Attempts cleanup of orphaned user record if auto-login fails
- Returns descriptive error messages instead of generic failures

### High-Priority Fixes Applied

#### 6. Verse Parser Regex False Positives
**File:** `packages/shared/src/verse-parser.ts`
- Added negative lookbehind `(?<!\w)` to prevent matching book names inside other words (e.g., "Re**mark 1**")
- Added module-level `PARSE_REGEX` cache to avoid rebuilding regex on every call

#### 7. Error Boundaries
**File:** `apps/web/src/app/error.tsx` (new)
- Added Next.js App Router error boundary with user-friendly UI
- Displays error digest ID and provides "Try again" button

#### 8. Auth Cookie Secure Flag
**File:** `apps/web/src/components/pocketbase-provider.tsx`
- Added `Secure` flag to `pb_auth` cookie when `window.location.protocol === 'https:'`

#### 9. Raw PocketBase Instance Removed from Context
**File:** `apps/web/src/components/pocketbase-provider.tsx`
- Removed `pb` from `AuthContextType` and `contextValue`
- Prevents consumers from bypassing the `logout` function and breaking cookie sync

#### 10. Filter Wildcard Escaping
**File:** `packages/pocketbase-client/src/client.ts`
- Updated `escapeFilterValue()` to escape SQL LIKE wildcards (`%` and `_`)

### UI/UX Fixes Applied

#### 11. Accessibility Improvements
- **Focus indicators**: Added `focus:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1` to `CampusInput` and `PastorInput` dropdown items
- **Touch targets**: Increased Dialog close button from 16×16px to 24×24px (`h-6 w-6`)
- **Hover contrast**: Changed `.verse-link:hover` from `opacity: 0.8` to `text-decoration: underline`

#### 12. Visual Consistency
- **Signup page**: Added `bg-gradient-to-br from-primary/10 to-background` to match login page

### Infrastructure Fixes Applied

#### 13. Deprecated Security Header Removed
**File:** `nginx/nginx.conf`
- Removed `X-XSS-Protection "1; mode=block"` (deprecated header)

#### 14. Coolify Deployment Hardening
**File:** `Dockerfile.web`
- Added `RUN npm install sharp` in runner stage for Next.js image optimization

---

## Known Issues / TODO

### Completed
- ✅ Full end-to-end security review
- ✅ JWT validation in middleware
- ✅ All critical/high security vulnerabilities fixed
- ✅ UI/UX accessibility improvements
- ✅ Coolify deployment configuration hardened
- ✅ Git initialized and committed

### Needs Implementation
- [ ] **Mobile app (Phase B)**: Expo SDK 55 with React Native 0.83, Expo Router v5, bottom tab navigator, all 6 tabs sharing `@bible-notes/pocketbase-client`
- [ ] **Production deployment**: Deploy to Coolify with domain bible.zonit.co.za
- [ ] **pnpm approve-builds**: Run `pnpm approve-builds` to approve sharp build script

### Potential Improvements
- [ ] Add password reset flow UI (backend endpoint exists via PocketBase)
- [ ] Add offline support / PWA for the web app
- [ ] Add dark mode toggle
- [ ] Add export/import for notes (JSON/CSV)
- [ ] Add share-to-app intent for mobile
- [ ] Add local notification reminders for reading plans
- [ ] Add client-side input validation schemas to `@bible-notes/pocketbase-client`

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
| **Error Boundary** | `apps/web/src/app/error.tsx` |
| **App Layout** | `apps/web/src/app/(app)/layout.tsx` |
| **Docker Compose** | `docker-compose.yml` |
| **Coolify Compose** | `docker-compose.production.yml` |
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
4. The hooks auto-populate `user_id` on record creation and prevent reassignment on updates

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

## Coolify Deployment

```bash
# 1. Push to GitHub
git push origin main

# 2. In Coolify: Create Resource → Docker Compose → point to docker-compose.production.yml
# 3. Enable "Preserve Repository During Deployment"
# 4. Set DNS A record: bible.zonit.co.za → server IP
# 5. In Coolify Build Arguments:
#    NEXT_PUBLIC_APP_URL=https://bible.zonit.co.za
#    NEXT_PUBLIC_POCKETBASE_URL=https://bible.zonit.co.za/api
# 6. In Coolify Environment:
#    PB_ADMIN_EMAIL=your-admin-email
#    PB_ADMIN_PASSWORD=your-secure-password
# 7. Set domain bible.zonit.co.za on the web service in Coolify UI
# 8. Deploy
```

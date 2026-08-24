# Bible Notes App — Project Status

**Last updated:** August 24, 2026
**Phase:** Phase A (Web App) — Complete, reviewed, hardened, and deployed
**Phase B (Mobile App — Expo SDK 54)**: Functional — 6 tabs, full CRUD, search, rich text, biometric login

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
| React Native | v0.81.x | Active (for Phase B) |
| Expo SDK | v54 | Stable |
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
│   └── mobile/                      # Expo SDK 55 (Phase B — scaffolded, 6 tabs + auth) ✅
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
- **Settings**: Export all data as JSON, import data back with error handling
- **UI Components**: shadcn/ui (button, input, card, badge, textarea, label, dialog, select, tabs, toggle, toggle-group), verse-badge, verse-input, campus-input, pastor-input, VerseContent, theme-toggle
- **Dark Mode**: System-aware dark theme toggle with next-themes and Tailwind v4 class strategy
- **PWA**: Service worker, manifest.json, installable web app with offline caching via @ducanh2912/next-pwa
- **Password Reset**: /forgot-password page using PocketBase requestPasswordReset

### Infrastructure
- **Docker Compose**: PocketBase + Next.js + Nginx for production
- **Docker Compose Production**: Coolify-ready with Traefik labels, no broken healthchecks
- **Nginx**: Reverse proxy with rate limiting, HTTPS support, security headers (X-XSS-Protection removed)
- **Scripts**: setup.sh (auto-setup), backup.sh (cron-ready with rotation), restore.sh (with safety backup)
- **Dockerfile.web**: Multi-stage Next.js production build with `sharp` for image optimization

---

## New Features (April 28, 2026)

### Dark Mode Toggle
- `next-themes` with system preference detection
- `ThemeProvider` wrapping app in `providers.tsx`
- Theme toggle button in sidebar and mobile header
- Full shadcn dark palette in `globals.css`

### PWA / Offline Support
- `@ducanh2912/next-pwa` integrated in `next.config.ts`
- `manifest.json` with app metadata and icon
- Service worker auto-generated on build (`sw.js`, `workbox-*`)

### Export / Import Data
- `packages/pocketbase-client/src/export-import.ts` with `exportAllData()` and `importData()`
- Settings page at `/settings` with Export (JSON download) and Import (file picker)
- Per-item error handling during import

### Password Reset Flow
- `/forgot-password` page with email input
- Success message: "If an account exists with this email, you will receive a password reset link."
- "Forgot password?" link on login page

### Zod Validation Schemas Extracted
- All form schemas moved to `packages/shared/src/validation.ts`
- Reused across all 8 form pages (create + edit)

---

## Recent Work (May 2026)

### Rich Text Editing (Web + Mobile)
- **Web**: TipTap `RichTextEditor` (bold/italic/underline/lists/links) on all create/edit forms for bible notes, small groups, sermons, revelations
- **Web**: `HtmlContent` renders stored HTML safely via DOMPurify sanitization; `VerseContent` linkifies verses in plain text
- **Mobile**: `RichTextInput` (TipTap-based), `SmartContent` auto-detects HTML vs Markdown, `HtmlVerseContent` (react-native-render-html) with verse linking, `MarkdownContent` (react-native-markdown-display)

### Bible Notes Title Field
- New required `title` field on `bible_notes` (migration `005` with backfill from verse refs/content)
- Types, Zod validation, client, import/export, web + mobile UI all updated

### Mobile Search & Polish
- Search bars + quick delete (with confirmation) on all 5 list screens; pull-to-refresh; dashboard refreshes on focus
- Horizontal padding and spacing fixes on detail screens

### Mobile Biometric Login
- Fingerprint/FaceID login via `expo-local-authentication` + `expo-secure-store` (`apps/mobile/lib/biometric-auth.ts`)
- Credentials stored in SecureStore, 7-day session, opt-in modal after password login

### Web Responsive UI
- `MobileSearchBar` + `FilterSheet` bottom-sheet filters on list pages (small screens), collapsible list cards, dashboard titles, `PasswordInput` with visibility toggle

### Sermons
- Verse linking in sermon detail (`linkifyVersesInHtml` in shared), HTML tag stripping in list previews, spacing fixes

### Docker / Deployment
- New `docker-compose.dev.yml` + `docker-compose.production.yml` (Coolify/Traefik), healthchecks on both services, `Dockerfile.pocketbase` + custom entrypoint (superuser auto-create), `Dockerfile.web.dev` for hot-reload dev

### Security & Tooling (Aug 2026)
- **Migration `006`**: fixed `users.deleteRule` from `""` (anyone could delete any account) to `id = @request.auth.id` (owner-only) — verified live against PocketBase 0.37.2
- **ESLint set up** for web (`eslint-config-next`) and mobile (`eslint-config-expo`) — `pnpm lint` works
- **Mobile type-check fixed**: removed legacy duplicate `Button/Card/Input/Screen.tsx` casing-collision files

---

## Comprehensive Review & Fixes (April 27–28, 2026)

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

#### 4. dangerouslySetInnerHTML Eliminated
**File:** `apps/web/src/components/verse-content.tsx` (new shared component)
- Extracted `VerseContent` React component that safely renders verse-linked content
- Applied to all 5 content pages: bible-notes, small-groups, sermons, revelations list, revelations detail
- Eliminates all XSS vectors; no raw HTML injection anywhere
- Fixed small-groups newline rendering bug (`<br/>` was rendering as literal text due to HTML escaping in `linkifyVerses`)

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

#### 15. Sign-Out Redirect
**File:** `apps/web/src/app/(app)/layout.tsx`
- Added `router.push('/login')` after `logout()` so users are redirected to login after signing out

#### 16. PocketBase Client URL Fallback
**File:** `packages/pocketbase-client/src/client.ts`
- Fixed double `/api/` bug: changed fallback from `${window.location.origin}/api` to `window.location.origin`
- PocketBase JS SDK already appends `/api/` automatically

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
- [ ] **Mobile polish (remaining)**: Share-to-app intent, local notification reminders for reading plans, PNG icon conversion for app store submission
- [ ] **CSV export option** in addition to JSON
- [ ] **Production deployment refresh**: Redeploy to Coolify with latest changes at bible.zonit.co.za (applies migration `006` security fix)

### Completed Recently
- ✅ **Mobile app (Phase B)**: Expo SDK 54 + Expo Router v6 — auth, 6 tabs, full CRUD with rich text, search + quick delete, biometric login
- ✅ **Rich text editing**: TipTap editor + DOMPurify-safe HTML rendering on web and mobile
- ✅ **Bible notes title field**: Migration 005 + backfill, full-stack support
- ✅ **Production deployment**: Deployed to Coolify with domain bible.zonit.co.za
- ✅ **Users deleteRule security fix**: Migration 006 restricts account deletion to the owner
- ✅ **Password reset flow UI**: `/forgot-password` page complete
- ✅ **PWA / offline support**: Service worker, manifest, installable app
- ✅ **Dark mode toggle**: System-aware with manual override
- ✅ **Export/import notes**: JSON export/import with error handling
- ✅ **Client-side Zod validation**: All schemas extracted to `@bible-notes/shared`
- ✅ **ESLint + type-check green**: Web and mobile both lint and type-check clean

### Potential Improvements
- [ ] Add share-to-app intent for mobile
- [ ] Add local notification reminders for reading plans
- [ ] Add CSV export option in addition to JSON

---

## Key Files Reference

| Purpose | File |
|---|---|
| **Implementation Plan** | `PLAN.md` |
| **This Status File** | `STATUS.md` |
| **PocketBase Migration** | `server/pb_migrations/001_init_collections.js` (+ `002`–`006`: service type, rules, title field, delete-rule fix) |
| **PocketBase Hooks** | `server/hooks/main.pb.js` |
| **Reading Plan Seeds** | `server/seed/reading-plans/*.json` |
| **Shared Types** | `packages/shared/src/types.ts` |
| **Verse Parser** | `packages/shared/src/verse-parser.ts` |
| **PB Client (CRUD)** | `packages/pocketbase-client/src/*.ts` |
| **Auth Provider** | `apps/web/src/components/pocketbase-provider.tsx` |
| **Auth Middleware** | `apps/web/src/middleware.ts` |
| **Error Boundary** | `apps/web/src/app/error.tsx` |
| **App Layout** | `apps/web/src/app/(app)/layout.tsx` |
| **Theme Toggle** | `apps/web/src/components/theme-toggle.tsx` |
| **Verse Content** | `apps/web/src/components/verse-content.tsx` |
| **Validation Schemas** | `packages/shared/src/validation.ts` |
| **Export/Import** | `packages/pocketbase-client/src/export-import.ts` |
| **Settings Page** | `apps/web/src/app/(app)/settings/page.tsx` |
| **Mobile App** | `apps/mobile/` |
| **Mobile Auth** | `apps/mobile/components/auth-provider.tsx` |
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

## Mobile App Testing

## Prerequisites
- Node.js v24
- Android Studio (for Android emulator) or Xcode (for iOS simulator)
- Expo Go app on physical device (optional)

## Quick Start

```bash
cd /home/ziel/development/ai_testing/bible-notes

# 1. Ensure dependencies are installed
pnpm install

# 2. Build shared packages
pnpm --filter @bible-notes/shared build
pnpm --filter @bible-notes/pocketbase-client build

# 3. Start the mobile app
cd apps/mobile
pnpm dev        # or: npx expo start

# 4. Press 'a' for Android emulator, 'i' for iOS simulator
#    Or scan QR code with Expo Go app on physical device
```

## Configuration
The mobile app connects to the same PocketBase backend as the web app. Update `EXPO_PUBLIC_POCKETBASE_URL` in `apps/mobile/.env` if needed:
```
EXPO_PUBLIC_POCKETBASE_URL=http://localhost:8090
```

For testing against production:
```
EXPO_PUBLIC_POCKETBASE_URL=https://bible.zonit.co.za
```

## Current Mobile Features
- **Auth**: Login screen, signup screen, auto-redirect if already authenticated, logout in tab header, **fingerprint/FaceID login** (SecureStore + 7-day session)
- **Home tab**: Recent Bible Notes, Sermons, Revelations with navigation to detail
- **Notes tab**: List with search + pull-to-refresh, "+ New" button, verse refs, content preview, detail view with edit/delete
- **Sermons tab**: List with search + "+ New" button, pastor/campus/service type, detail view with edit/delete
- **Small Groups tab**: List with search + "+ New" button, topic/attendees, detail view with edit/delete
- **Reading Plans tab**: List with "+ New" button, progress bars, detail view with interactive day toggles and delete
- **Revelations tab**: Quick-jot input at top, list with search + pull-to-refresh, "+ New" button, detail view with edit/delete
- **Create screens**: Full forms for all 5 collections (Bible Notes, Small Groups, Sermons, Reading Plans, Revelations) with `RichTextInput`
- **Edit screens**: Inline edit mode on all detail screens with save/cancel
- **Content rendering**: `SmartContent` auto-detects HTML vs Markdown; verse references link out to Bible Gateway
- **Delete**: Alert/quick-delete with confirmation on all detail + list screens
- **Settings screen**: App settings with logout
- **Icons**: SVG app icons (icon, adaptive-icon, splash)

## Missing Mobile Features (TODO)
- Share-to-app intent
- Local notification reminders for reading plans
- Convert SVG icons to PNG for app store submission

---

# Docker Production Deployment

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

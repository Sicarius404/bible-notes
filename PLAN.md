# Bible Notes App — Implementation Plan

## Overview

A self-hosted Bible note-taking app with web (Next.js 16) and mobile (Expo SDK 55) frontends, backed by PocketBase. Features include daily Bible reading notes with verse auto-linking, small group notes, sermon notes, reading plans with progress tracking, and a quick-jot revelations tab.

## Tech Stack (Verified Latest LTS/Stable — April 2026)

| Technology | Version | Status |
|---|---|---|
| Node.js | v24.x LTS (Krypton) | Active LTS |
| Next.js | v16.2.x | Active LTS |
| React | v19.2.x | Stable |
| React Native | v0.81.x | Active |
| Expo SDK | v54 | Stable |
| PocketBase | v0.37.2 | Latest |
| PocketBase JS SDK | v0.26.8 | Latest |
| TypeScript | v6.0.3 | Stable |
| Nginx | v1.30 | Stable |
| Turborepo | v2.9.x | Stable |
| SQLite | 3.53.0 | Bundled with PocketBase |
| Tailwind CSS | v4 | Latest |
| shadcn/ui | Latest | Component library |
| TanStack Query | v5 | Server state |
| React Hook Form + Zod | Latest | Forms + validation |
| date-fns | Latest | Date handling |
| Lucide React | Latest | Icons |

## Design Decisions

- **UI Style**: Minimal & clean (Notion/Apple Notes aesthetic)
- **Campus handling**: Auto-save tag input — campuses build up from what you type
- **Bible links**: Bible Gateway, NIV default (`https://www.biblegateway.com/passage/?search={ref}&version=NIV`)
- **Auth**: PocketBase built-in auth (email/password)
- **Hosting**: Self-hosted via Docker Compose
- **Backup**: Single-file SQLite backup + automated cron script with rotation
- **Build order**: Web first, mobile second

## Directory Structure

```
bible-notes/
├── apps/
│   ├── web/                        # Next.js 16 app
│   └── mobile/                      # Expo SDK 55 app (Phase B)
├── packages/
│   ├── shared/                      # Types, constants, verse parser
│   │   ├── src/
│   │   │   ├── types.ts
│   │   │   ├── constants.ts
│   │   │   ├── verse-parser.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── pocketbase-client/           # PB SDK wrapper
│       ├── src/
│       │   ├── client.ts
│       │   ├── auth.ts
│       │   ├── bible-notes.ts
│       │   ├── sermons.ts
│       │   ├── small-groups.ts
│       │   ├── reading-plans.ts
│       │   ├── revelations.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── server/
│   ├── pb_migrations/
│   │   └── 001_init_collections.js
│   ├── hooks/
│   │   └── main.pb.js
│   └── seed/
│       └── reading-plans/
│           ├── bible-in-90-days.json
│           ├── bible-in-180-days.json
│           ├── bible-in-365-days.json
│           └── nt-in-30-days.json
├── scripts/
│   ├── setup.sh
│   ├── backup.sh
│   └── restore.sh
├── nginx/
│   └── nginx.conf
├── backups/                         # .gitignored
├── docker-compose.yml
├── docker-compose.dev.yml
├── Dockerfile.web
├── turbo.json
├── package.json
├── tsconfig.base.json
├── .gitignore
├── .env.example
└── PLAN.md                          # This file
```

## Data Models

### BibleNote
- `id`: string
- `user_id`: string (relation → users)
- `title`: text (max 255)
- `date`: date
- `verse_refs`: json (array of strings like ["John 3:16", "Psalm 23:1-6"])
- `content`: text
- `created_at`: auto
- `updated_at`: auto

### SmallGroupNote
- `id`: string
- `user_id`: string (relation → users)
- `date`: date
- `topic`: text
- `attendees`: text
- `content`: text
- `created_at`: auto
- `updated_at`: auto

### Sermon
- `id`: string
- `user_id`: string (relation → users)
- `date`: date
- `title`: text
- `pastor`: text
- `campus`: text (auto-save tag input)
- `service_type`: select ("morning" | "evening")
- `content`: text
- `created_at`: auto
- `updated_at`: auto

### ReadingPlan
- `id`: string
- `user_id`: string (relation → users)
- `name`: text
- `total_days`: number
- `start_date`: date
- `plan_data`: json (array of {day, passages[]})

### ReadingPlanProgress
- `id`: string
- `plan_id`: string (relation → reading_plans)
- `user_id`: string (relation → users)
- `day_number`: number
- `completed`: bool
- `completed_at`: date

### Revelation
- `id`: string
- `user_id`: string (relation → users)
- `date`: date
- `content`: text
- `created_at`: auto
- `updated_at`: auto

## Web App Routes (Next.js App Router)

```
apps/web/src/app/
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (app)/
│   ├── layout.tsx              # Tab navigation layout
│   ├── page.tsx                 # Home dashboard
│   ├── bible-notes/
│   │   ├── page.tsx             # List (searchable by verse/date)
│   │   ├── new/page.tsx         # Create note
│   │   └── [id]/page.tsx       # Edit/view note
│   ├── small-groups/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── sermons/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── reading-plans/
│   │   ├── page.tsx             # List plans + progress
│   │   └── [id]/page.tsx       # Plan detail + daily checkmarks
│   └── revelations/
│       ├── page.tsx              # Quick-jot list
│       └── [id]/page.tsx       # View/edit
├── layout.tsx                   # Root layout (providers)
└── globals.css
```

## Key Features

### Verse Auto-Linking
Regex detects patterns like `John 3:16`, `Romans 8:1-11`, `Psalm 23`, `1 John 2:3`, etc.
Converts each to: `https://www.biblegateway.com/passage/?search={encoded_ref}&version=NIV`

### Campus Auto-Save
Combobox/tag-input that auto-suggests previously used campus names. New campuses added to the pool automatically.

### Reading Plan Progress
Calendar-style view with day-by-day checkmarks. Checking sets `completed: true` + `completed_at: now()`. Progress percentage shown.

### Revelations Tab
Single text input at top, press Enter to save. List below shows recent items. Minimal friction.

### Search (Bible Notes)
Filter by verse reference (partial match), date range, and full-text content search.

## Reading Plans (Seed Data)

| Plan | Days | Daily Load |
|---|---|---|
| Bible in 90 Days | 90 | ~13-14 chapters/day |
| Bible in 180 Days | 180 | ~7 chapters/day |
| Bible in 365 Days | 365 | ~3-4 chapters/day |
| NT in 30 Days | 30 | ~8-9 chapters/day |

Users can also create custom plans.

## Backup Strategy

- PocketBase: `./pocketbase backup` CLI or admin UI → creates `.zip` with SQLite DB + uploaded files
- Automated: cron job runs `scripts/backup.sh` daily at 3 AM
- Rotation: keep daily for 7 days, weekly for 8 weeks, monthly for 12 months
- Restore: stop PocketBase → replace `pb_data/` → restart
- JSON export also available via PocketBase admin UI for off-site backup

## Docker Compose

Services:
- **pocketbase**: PocketBase v0.37.2 on port 8090, volumes for pb_data and pb_migrations
- **web**: Next.js 16 production build on port 3000
- **nginx**: Nginx 1.30 reverse proxy on ports 80/443, routes `/` → web, `/api/` → pocketbase

## Environment Variables (.env.example)

```
POCKETBASE_URL=http://localhost:8090
POCKETBASE_ADMIN_EMAIL=admin@example.com
POCKETBASE_ADMIN_PASSWORD=changeme
NEXT_PUBLIC_POCKETBASE_URL=http://localhost:8090
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BIBLE_GATEWAY_URL=https://www.biblegateway.com/passage/
NEXT_PUBLIC_DEFAULT_BIBLE_VERSION=NIV
EXPO_PUBLIC_POCKETBASE_URL=http://localhost:8090
```

## Execution Order

### Phase A — Web App
1. Root monorepo setup
2. packages/shared (types, constants, verse parser)
3. packages/pocketbase-client (CRUD wrapper)
4. PocketBase migrations + seed data
5. Web app scaffolding (Next.js 16 + Tailwind v4 + shadcn/ui)
6. Auth pages
7. Home dashboard
8. Bible Notes tab
9. Small Groups tab
10. Sermons tab
11. Reading Plans tab
12. Revelations tab
13. Scripts (setup, backup, restore)

### Phase B — Mobile App (after web is complete)
14. Expo SDK 55 scaffolding + Expo Router v5
15. Bottom tab navigator
16. Auth screens
17. All 6 tab screens
18. Mobile-specific UX

### Phase C — Deployment
19. Docker Compose + Nginx
20. Backup automation
21. Documentation
# Repository Atlas: bible-notes

## Project Responsibility
A full-stack Bible notes application — users can take notes on Bible verses, track reading plans, log sermon notes, record revelations, and organize small group discussions. Monorepo with Next.js web app, Expo React Native mobile app, and PocketBase backend.

## System Entry Points
- `apps/web/` — Next.js (App Router) web frontend
- `apps/mobile/` — Expo React Native mobile app
- `server/` — PocketBase backend with Docker
- `packages/shared/` — Shared types, validation, verse parsing
- `packages/pocketbase-client/` — PocketBase API client wrapper

## Directory Map

| Directory | Responsibility | Detailed Map |
|-----------|---------------|--------------|
| `apps/` | Web (Next.js) and mobile (Expo) frontends | [View Map](apps/codemap.md) |
| `apps/web/` | Next.js frontend with shadcn/ui | [View Map](apps/web/codemap.md) |
| `apps/web/src/` | App Router pages, components, hooks, utilities | [View Map](apps/web/src/codemap.md) |
| `apps/web/src/app/` | Route groups and page layouts | [View Map](apps/web/src/app/codemap.md) |
| `apps/web/src/app/(app)/` | Authenticated app pages (7 feature areas) | [View Map](apps/web/src/app/(app)/codemap.md) |
| `apps/web/src/app/(auth)/` | Login, signup, forgot-password | [View Map](apps/web/src/app/(auth)/codemap.md) |
| `apps/web/src/components/` | UI components and shadcn/ui primitives | [View Map](apps/web/src/components/codemap.md) |
| `apps/web/src/hooks/` | Custom React hooks | [View Map](apps/web/src/hooks/codemap.md) |
| `apps/web/src/lib/` | Utility functions | [View Map](apps/web/src/lib/codemap.md) |
| `apps/mobile/` | Expo React Native mobile app | [View Map](apps/mobile/codemap.md) |
| `apps/mobile/app/` | Expo Router screens and navigation | [View Map](apps/mobile/app/codemap.md) |
| `packages/` | Shared packages (types, client) | [View Map](packages/codemap.md) |
| `packages/shared/` | Types, Zod validation, verse parser | [View Map](packages/shared/codemap.md) |
| `packages/pocketbase-client/` | PocketBase client (auth, CRUD, export) | [View Map](packages/pocketbase-client/codemap.md) |
| `server/` | PocketBase backend | [View Map](server/codemap.md) |
| `server/pb_migrations/` | Database schema migrations | [View Map](server/pb_migrations/codemap.md) |
| `server/hooks/` | PocketBase JS hooks (auth, data sync) | [View Map](server/hooks/codemap.md) |
| `server/seed/` | Seed data (reading plans) | [View Map](server/seed/codemap.md) |
| `nginx/` | Local dev reverse proxy config | [View Map](nginx/codemap.md) |
| `scripts/` | Backup, restore, setup scripts | [View Map](scripts/codemap.md) |

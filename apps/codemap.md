# apps/

## Responsibility
Hosts the frontend applications in the monorepo. Contains two apps: a Next.js web frontend (`web/`) and a React Native / Expo mobile app (`mobile/`). Both apps consume shared packages (`@bible-notes/shared`, `@bible-notes/pocketbase-client`) and connect to the same PocketBase backend.

## Design
- **Monorepo with Turborepo**: Both apps live in this directory and are managed via pnpm workspaces + Turborepo.
- **Code sharing**: Types, validation schemas, and PocketBase API calls are extracted into `packages/shared` and `packages/pocketbase-client` respectively, keeping app code thin.
- **PWA support**: The web app is configured as a progressive web app with service worker registration via `@ducanh2912/next-pwa`.

## Files
- `web/` — Next.js 15 (App Router) web frontend with PWA support. The primary Bible notes application.
- `mobile/` — React Native / Expo mobile app. Structure includes `app/` (Expo Router), `components/`, `theme.ts`, and `metro.config.js`.

## Integration
- **Depends on**: `packages/shared` (types, schemas, constants), `packages/pocketbase-client` (API layer)
- **Consumed by**: Deployed to Coolify (web) and app stores (mobile)

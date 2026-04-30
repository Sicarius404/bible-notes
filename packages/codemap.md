# packages/

## Responsibility
The packages directory houses the reusable library code shared across the monorepo. It contains two packages:
- `@bible-notes/shared` — Pure TypeScript utilities, types, validation schemas, and verse parsing logic with zero runtime dependencies beyond `zod`.
- `@bible-notes/pocketbase-client` — The PocketBase SDK wrapper providing typed CRUD operations, authentication, and data export/import for all application entities.

These packages are consumed by `apps/web` (Next.js frontend) and could potentially be consumed by other consumers (mobile app, scripts, etc.).

## Design
- **Workspace packages** — Both use `pnpm` workspace protocol (`"workspace:*"`) for local dependency resolution and Turborepo for build orchestration.
- **Dual CJS/ESM exports** — Both define `main`, `types`, and `exports` fields in package.json for compatibility.
- **Tree-shakeable** — The `shared` package has zero non-dev runtime dependencies (only `zod`), and `pocketbase-client` depends on `pocketbase` SDK + `@bible-notes/shared`.
- **Type-safe layer** — The `pocketbase-client` wraps PocketBase's dynamic Record type into typed interfaces from `@bible-notes/shared`.
- **Singleton client pattern** — The PocketBase client instance is cached as a module-level singleton, reset on logout.

## Files
- `shared/` — Utilities, types, validation, verse parser
- `pocketbase-client/` — Typed PocketBase CRUD wrappers for all entities

## Integration
- **Depended on by:** `apps/web` (and any future consumers)
- **Depends on:** `pocketbase` SDK (pocketbase-client), `zod` (shared)
- **Not consumed by:** Backend (PocketBase hooks run in a separate JS runtime)

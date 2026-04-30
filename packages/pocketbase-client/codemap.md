# packages/pocketbase-client/

## Responsibility
Typed wrapper around the PocketBase JavaScript SDK. Provides a domain-specific API for all CRUD operations, authentication, and data portability. Every function operates on typed interfaces from `@bible-notes/shared`, insulating consumers from PocketBase's dynamic `Record` model.

## Design
- **Singleton client** — A single `PocketBase` instance is cached at module scope (`client.ts`). Created on first access, reset on logout.
- **Multi-environment URL resolution** — The client URL is resolved from environment variables in priority order: `EXPO_PUBLIC_POCKETBASE_URL` → `NEXT_PUBLIC_POCKETBASE_URL` → `window.location.origin` (browser) → `POCKETBASE_URL` env var (SSR) → `http://localhost:8090` (fallback).
- **Filter escaping** — `escapeFilterValue()` sanitizes user input for PocketBase filter strings, preventing injection via single quotes, backslashes, and wildcard characters.
- **Consistent CRUD pattern** — Each entity module follows the same pattern: `create`, `get`, `update`, `delete`, `list` functions with typed params and return types.
- **Search/pagination** — List functions accept search params with filter composition (date range, text search, entity-specific fields) and return paginated results with `items`, `totalPages`, `totalItems`, and `page`.
- **Lazy-loading** — The client instance is lazily initialized and cached; `resetPocketBase()` allows re-initialization (e.g., after URL change).

## Files
- `package.json` — Package config: `@bible-notes/pocketbase-client`, depends on `pocketbase` SDK and `@bible-notes/shared`.
- `src/` — Source code (see `src/codemap.md` for details).

## Integration
- **Depended on by:** `apps/web` (all server actions, API routes, and client components needing data access)
- **Depends on:** `@bible-notes/shared` (types), `pocketbase` (SDK)

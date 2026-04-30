# packages/shared/

## Responsibility
Provides the single source of truth for TypeScript types, Zod validation schemas, application constants, and Bible verse parsing utilities shared across all consumers (web app, tests, scripts). This is the **contract layer** of the application — any entity shape or constraint defined here governs how data flows between frontend and PocketBase.

## Design
- **No framework dependency** — Pure TypeScript + Zod only (1 runtime dep: `zod`).
- **Barrel export** — `src/index.ts` re-exports everything from `types`, `constants`, `verse-parser`, and `validation` modules. Consumers import from `@bible-notes/shared`.
- **Zod-first validation** — Input validation schemas mirror the TypeScript interfaces. Zod schemas are the source of truth for form validation and API boundary checks.
- **Comprehensive verse parser** — A regex-based Bible reference parser supporting ~70 books with abbreviations, verse ranges, chapter ranges, and link generation.
- **Single-responsibility modules** — Each `.ts` file has one clear concern: types, constants, validation, or parsing.

## Files
- `package.json` — Package config: `@bible-notes/shared`, `zod` dependency, TypeScript build.
- `src/` — Source code (see `src/codemap.md` for details).

## Integration
- **Depended on by:** `@bible-notes/pocketbase-client`, `apps/web`
- **Depends on:** `zod` (validation library)

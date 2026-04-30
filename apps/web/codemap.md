# apps/web/

## Responsibility
The Next.js web frontend for Bible Notes. This is the primary user-facing application — a full-featured Bible study companion that lets users take notes, track sermons, manage reading plans, record revelations, and log small group sessions.

## Design
- **Next.js 15 with App Router**: Uses the modern App Router with route groups (`(app)` for authenticated pages, `(auth)` for public auth pages).
- **PWA enabled**: Configured with `@ducanh2912/next-pwa` for offline support, service worker registration, and manifest generation.
- **Standalone output**: Configured with `output: 'standalone'` for Docker deployment.
- **Workspace dependencies**: Transpiles `@bible-notes/shared` and `@bible-notes/pocketbase-client` via `transpilePackages`.
- **Tailwind CSS v4**: Uses PostCSS with `@tailwindcss/postcss` for utility-first styling.
- **TypeScript strict mode**: Enforced via `tsconfig.json`.
- **Validation**: Uses Zod schemas (from `@bible-notes/shared`) with `react-hook-form` and `@hookform/resolvers`.

## Files
- `package.json` — App name `@bible-notes/web`. Key deps: Next.js 16, React 19, TanStack React Query 5, PocketBase SDK, shadcn/ui components (Radix primitives), `date-fns`, `react-hook-form`, `zod`, `next-themes`.
- `next.config.ts` — Configures PWA via `@ducanh2912/next-pwa`, standalone output, and workspace package transpilation.
- `postcss.config.mjs` — PostCSS config for Tailwind CSS v4.
- `tsconfig.json` — TypeScript configuration.
- `next-env.d.ts` — Next.js TypeScript declarations (auto-generated).
- `.env` — Environment variables (local dev).

## Integration
- **Depends on**: `@bible-notes/shared` (types, schemas, constants), `@bible-notes/pocketbase-client` (API layer), `@tanstack/react-query` (server state), `pocketbase` SDK
- **Consumed by**: Users via browser at `bible.zonit.co.za` (port 3000 behind Traefik)

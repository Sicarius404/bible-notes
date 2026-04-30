# apps/web/src/

## Responsibility
The main source directory for the Next.js web frontend. Contains all application code: pages, components, hooks, utilities, and middleware.

## Design
- **App Router structure**: `app/` contains all route groups and pages using Next.js App Router conventions.
- **Colocation**: Components are kept close to where they're used (shared components in `components/`, page-specific components live alongside their pages in `app/`).
- **Client components**: Most pages are `'use client'` since they rely on React hooks, TanStack Query, and form state.
- **Auth gating**: `middleware.ts` protects authenticated routes by validating the PocketBase auth cookie (`pb_auth`).

## Files
- `middleware.ts` — Auth middleware that checks for valid `pb_auth` cookie and redirects unauthenticated users to `/login` (with redirect param). Allows public auth paths (`/login`, `/signup`), static files (`/_next`), and API routes.
- `app/` — Next.js App Router pages (route groups, layouts, error boundary, global CSS)
- `components/` — Shared React components (UI primitives from shadcn/ui + domain-specific components)
- `hooks/` — Custom React hooks (currently: `use-debounce`)
- `lib/` — Utility functions (currently: `cn()` helper combining `clsx` + `tailwind-merge`)

## Integration
- **Depends on**: Components in `components/`, hooks in `hooks/`, utils in `lib/`, external packages (TanStack Query, PocketBase SDK, shared schemas)
- **Consumed by**: The Next.js build pipeline; produces the server-rendered and client-side application bundle

# apps/web/src/app/

## Responsibility
Next.js App Router pages and layouts. Contains the root layout, global styles, error boundary, and two route groups that separate authenticated pages from public authentication pages.

## Design
- **Route groups**: Uses Next.js route groups `(app)` for authenticated pages and `(auth)` for public pages. This keeps the URL clean (no group prefix in paths) while allowing different layouts.
- **Root layout**: Wraps all pages in `<Providers>` (TanStack Query, theme, PocketBase auth context).
- **PWA metadata**: Includes `manifest.json`, `appleWebApp` config, and `themeColor` viewport meta tag.
- **Error boundary**: A global `error.tsx` catches rendering errors with a retry button.
- **Tailwind CSS v4**: Custom CSS variables defined via `@theme` for light/dark color tokens. Dark mode uses the `.dark` class variant.

## Files
- `layout.tsx` — Root layout: sets HTML lang, applies `<Providers>`, exports metadata (title, description, PWA manifest/apple config) and viewport (theme color, responsive).
- `globals.css` — Tailwind CSS v4 imports. Defines `@theme` tokens (colors, border radius), body styles, `.verse-link` class, and `.dark` variant overrides for all color tokens (dark background, muted text, etc.).
- `error.tsx` — Client error boundary component with error digests, alert icon, and "Try again" button.
- `(app)/` — Route group for authenticated pages (dashboard, bible-notes, sermons, reading plans, revelations, small groups, settings). All wrapped in the sidebar layout.
- `(auth)/` — Route group for authentication pages (login, signup, forgot password). All wrapped in the centered card layout.

## Integration
- **Depends on**: `components/providers.tsx` for context providers, `globals.css` for styling
- **Consumed by**: Next.js build process; rendered as the application shell and page content

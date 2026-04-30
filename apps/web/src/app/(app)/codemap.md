# apps/web/src/app/(app)/

## Responsibility
Authenticated application pages. Contains the main dashboard and all CRUD features: Bible notes, sermons, reading plans, revelations, small group notes, and settings. All pages are behind auth middleware.

## Design
- **Sidebar layout**: A shared `layout.tsx` renders a responsive sidebar (desktop: fixed 256px, mobile: sheet overlay). Navigation includes links to all sections and a sign-out button. The layout uses Lucide icons, shadcn/ui `Sheet` for mobile nav, and a `<ThemeToggle>`.
- **Dashboard home** (`page.tsx`): Landing page showing quick-action cards (New Note, New Sermon, Reading Plan, Revelation), reading plan progress, and recent items (notes, sermons, revelations) fetched via TanStack Query.
- **Consistent CRUD pattern**: Each entity follows the same pattern:
  - `page.tsx` — List view with filters, search with debounce, pagination, empty state, loading skeletons
  - `new/page.tsx` — Creation form with Zod validation via `react-hook-form` and `@hookform/resolvers`
  - `[id]/page.tsx` — Detail view with inline edit mode, delete confirmation dialog
- **Client components**: All pages are `'use client'` since they use hooks, form state, and TanStack Query.
- **Data fetching**: All API calls go through `@bible-notes/pocketbase-client`, wrapped in `useQuery`/`useMutation` hooks with automatic cache invalidation on mutations.
- **Common features**: Loading skeleton states, empty states with encouraging CTAs, toast-free error handling (inline error messages), pagination with prev/next buttons.

## Pages

### Dashboard (`/`)
- Quick action grid (4 cards linking to create/list pages)
- Reading plan progress cards with progress bars
- Recent Bible notes (3 items), recent sermons (3 items)
- Recent revelations (3 items)
- Loading skeletons for each section

### Bible Notes (`/bible-notes`)
- **List** — Filterable by verse reference, date range, and full-text search (debounced 300ms). Paginated (10 per page). Each item shows verse reference badges, date, and content preview.
- **New** — Date picker, verse reference input with badge display (add/remove), auto-detection of verse refs from content via `extractVerseRefs()`, and a rich textarea. Zod-validated with `bibleNoteSchema`.
- **Detail** (`[id]`) — Shows verse badges linking to BibleGateway, content rendered via `VerseContent` (clickable verse refs). Inline edit mode with same form fields as new. Delete with confirmation dialog.

### Sermons (`/sermons`)
- **List** — Search, pastor filter (debounced), campus dropdown, service type toggle group (morning/Sunday/evening), date range, pagination (10 per page). Each item shows title, pastor, campus, service type badge, date, and content preview.
- **New** — Form with date, title, pastor (autocomplete input), campus (autocomplete input), service type toggle group, content textarea. Uses `sermonSchema` from shared package.
- **Detail** (`[id]`) — Header with title, pastor/campus/date metadata, service type badge. View mode with verse-linked content. Inline edit with the full form. Delete via dialog.

### Reading Plans (`/reading-plans`)
- **List** — Grid of plan cards with progress bars and percentages. "Start a Plan" dialog with two tabs: presets (from `READING_PLAN_PRESETS` in shared package, imported from seed JSON) and custom (name, days, start date). Progress fetched via `getAllProgressRecords`.
- **New** — Full form with name, total days (dynamically adjusts day fields via `useFieldArray`), start date, and per-day comma-separated passage inputs.
- **Detail** (`[id]`) — Header with plan name, start date, total days. Overall progress bar. Day-by-day cards with toggle completion buttons (checkmark), passage badges (`VerseBadge`) linking to BibleGateway. Delete confirmation.

### Revelations (`/revelations`)
- **List** — Quick jot input at top (create inline, supports Enter to submit). Filterable by date range and full-text search. Paginated. Each item shows content (via `VerseContent` with clickable refs) and date. Inline edit and delete with confirmation dialog.
- **Detail** (`[id]`) — Full view with verse-linked content. Inline edit mode. Delete confirmation dialog.

### Small Groups (`/small-groups`)
- **List** — Filterable by topic, date range, and full-text search. Paginated (10 per page). Each card shows topic, date badge, attendee names, and content preview.
- **New** — Form with date, topic, attendees (comma-separated), and content textarea. Uses `smallGroupNoteSchema`.
- **Detail** (`[id]`) — Shows date, attendees, content with verse links. Inline edit mode. Delete confirmation dialog.

### Settings (`/settings`)
- Export all data as JSON download
- Import data from previously exported JSON file (validates structure, shows import summary with item counts and errors)

## Files
```
page.tsx                    — Dashboard home
layout.tsx                  — App shell with sidebar nav
bible-notes/
  page.tsx                  — List with filters, search, pagination
  new/page.tsx              — Create form with verse detection
  [id]/page.tsx             — Detail view with edit/delete
sermons/
  page.tsx                  — List with filters, search, pagination
  new/page.tsx              — Create form with pastor/campus/service type
  [id]/page.tsx             — Detail with edit/delete
reading-plans/
  page.tsx                  — List with progress bars + start-plan dialog
  new/page.tsx              — Create form with dynamic day fields
  [id]/page.tsx             — Detail with day-by-day progress tracking
revelations/
  page.tsx                  — List with quick-jot input, filters, pagination
  [id]/page.tsx             — Detail with edit/delete
small-groups/
  page.tsx                  — List with filters, search, pagination
  new/page.tsx              — Create form
  [id]/page.tsx             — Detail with edit/delete
settings/
  page.tsx                  — Export/import data management
```

## Integration
- **Depends on**: `@bible-notes/pocketbase-client` for all data operations, `@bible-notes/shared` for types/schemas/constants, `@tanstack/react-query` for server state, components in `components/` (CampusInput, PastorInput, VerseContent, VerseBadge, theme-toggle, pocketbase-provider, ui primitives), `hooks/use-debounce`, `lib/utils`
- **Consumed by**: Authenticated users via the browser at `/` and all sub-paths

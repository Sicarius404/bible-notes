# apps/mobile/app/(tabs)/

## Responsibility

Tab-based navigation hub for the main app experience. Provides six tabs: Home, Notes, Sermons, Plans, Revelations, and Groups. Each tab shows a list view of the corresponding content type with a FAB (floating action button) for creating new entries.

## Files

- **\_layout.tsx** — Tab navigator configuration using Expo Router's `<Tabs>`. Customizes header style (background, shadow, title typography), tab bar style (surface background, light border, 56px height), and active/inactive tint colors. Includes a global "Logout" button in the header right. Six tabs defined:
  - `index` → Home (greeting: "Hello, {user.firstName}")
  - `bible-notes` → Notes
  - `sermons` → Sermons
  - `reading-plans` → Plans
  - `revelations` → Revelations
  - `small-groups` → Groups (hidden from tab bar via `href: null`)
- **index.tsx** — Home dashboard screen. Loads recent data from all four content types in parallel (3 notes, 3 sermons, 3 revelations, 2 plans). Displays greeting, quick action buttons (New Note, Sermon, Revelation), and summary sections for Recent Notes, Recent Sermons, and Reading Plans. Uses `Card`, `CardTitle`, `CardSubtitle`, `Screen`, and `SectionHeader` from components.
- **bible-notes.tsx** — Bible Notes list screen. FlatList with pull-to-refresh, FAB to create new note, empty state guidance. Each card shows verse references, date, and content preview.
- **sermons.tsx** — Sermons list screen. Same pattern as bible-notes. Cards display title, pastor, campus, service type badge (using `SERVICE_TYPE_LABELS`), and date.
- **reading-plans.tsx** — Reading Plans list screen. Cards show plan name, total days, start date, and a progress bar (via `getPlanCompletionPercentage`). FAB navigates to create new plan.
- **revelations.tsx** — Revelations list screen. Unique: includes an inline create form at the top with a text input and "Add" button for quick capture, plus a "Full Form" button for the dedicated creation screen. Cards show content preview and date.
- **small-groups.tsx** — Small Groups list screen. Standard list with FAB, cards show topic, date, and content preview.

## Integration

- **Depends on:** `@bible-notes/pocketbase-client` for all list/get/create/update/delete functions; `@bible-notes/shared` for types and `SERVICE_TYPE_LABELS`/`SERVICE_TYPES` constants; `./components/ui` for `Card`, `CardTitle`, `CardSubtitle`, `Screen`, `EmptyState`, `Input`, `Button`; `./theme` for colors/spacing/typography.
- **Used by:** Rendered as children of the root Stack layout. Each tab screen navigates to detail (`/[id]`) and create (`/new`) screens within their respective route directories.
- **Pattern:** All list screens follow a consistent pattern: `useEffect` → load data → show loading spinner → render FlatList with pull-to-refresh, FAB, and `EmptyState`.
- **Hidden tab:** `small-groups` is configured with `href: null` in `_layout.tsx`, meaning it's not shown in the tab bar but is still accessible via navigation.

# packages/pocketbase-client/src/

## Responsibility
Provides the complete typed data access layer for the Bible Notes application. Each entity in the system (bible notes, sermons, reading plans, etc.) has a dedicated module with CRUD operations, search/filter capabilities, and entity-specific query functions. The auth module handles user lifecycle. The export/import module provides full data portability.

## Files

### `client.ts` — PocketBase singleton & utilities
The foundation of the client wrapper. Key exports:

- **`getPocketBase(url?: string): PocketBase`** — Returns the cached singleton PocketBase instance, creating it on first call. URL resolution strategy:
  1. Explicit `url` parameter (for testing)
  2. `EXPO_PUBLIC_POCKETBASE_URL` env var (Expo)
  3. `NEXT_PUBLIC_POCKETBASE_URL` env var (Next.js public)
  4. `window.location.origin` (browser fallback)
  5. `POCKETBASE_URL` env var (SSR/internal)
  6. `http://localhost:8090` (development fallback)

- **`resetPocketBase(): void`** — Clears the cached instance to force re-initialization. Called during logout and URL changes.

- **`escapeFilterValue(value: string): string`** — Sanitizes strings for PocketBase filter syntax by escaping `\`, `'`, `%`, and `_` characters.

### `auth.ts` — Authentication & user management
Wraps PocketBase auth operations with typed `AuthUser` interface. Key exports:

- **`signUp(email, password, name?)`** — Creates account + auto-login with rollback on failure
- **`logIn(email, password)`** — Email/password authentication
- **`logOut()`** — Clears auth store and resets client instance
- **`getCurrentUser()`** — Returns `AuthUser | null` based on `authStore.isValid`
- **`isAuthenticated()`** — Simple boolean check
- **`requestPasswordReset(email)`** — Delegates to PocketBase's password reset flow
- **`updateProfile(data)`** — Updates name/avatar for the current user

The `AuthUser` interface exposes `id`, `email`, `name`, `avatar?`, `created`, `updated`.

### `bible-notes.ts` — Bible note CRUD
Collection: `bible_notes`. Functions:

- **`createBibleNote({ date, verse_refs, content })`** — Creates with auto-populated `user_id`
- **`getBibleNote(id)`** — Fetch single record by ID
- **`updateBibleNote(id, data)`** — Partial update (date, verse_refs, content)
- **`deleteBibleNote(id)`** — Delete record
- **`listBibleNotes(params?)`** — Paginated list with filters: `verse_ref`, `date_from`, `date_to`, `search` (content text match). Sorted by `-date`.
- **`getAllVerseRefs()`** — Aggregates all unique verse references across user's notes (for autocomplete). Fetches only the `verse_refs` field for efficiency.

### `small-groups.ts` — Small group note CRUD
Collection: `small_group_notes`. Functions:

- **`createSmallGroupNote({ date, topic, attendees, content })`** — Auto-populates `user_id`
- **`getSmallGroupNote(id)`**, **`updateSmallGroupNote(id, data)`**, **`deleteSmallGroupNote(id)`** — Standard CRUD
- **`listSmallGroupNotes(params?)`** — Paginated list with filters: `topic`, `date_from`, `date_to`, `search` (content). Sorted by `-date`.

### `sermons.ts` — Sermon note CRUD
Collection: `sermons`. Functions:

- **`createSermon({ date, title, pastor, campus, service_type, content })`** — All required fields, auto-populates `user_id`
- **`getSermon(id)`**, **`updateSermon(id, data)`**, **`deleteSermon(id)`** — Standard CRUD
- **`listSermons(params?)`** — Paginated list with filters: `pastor`, `campus`, `service_type`, `date_from`, `date_to`, `search` (content). Sorted by `-date`.
- **`getAllCampuses()`** — Aggregates unique campus values (for autocomplete). Fetches only the `campus` field.
- **`getAllPastors()`** — Aggregates unique pastor names (for autocomplete). Fetches only the `pastor` field.

### `reading-plans.ts` — Reading plan CRUD + progress tracking
Two collections: `reading_plans` (plan metadata + day/passage data) and `reading_plan_progress` (per-day completion records).

**Plan CRUD:**
- **`createReadingPlan({ name, total_days, start_date, plan_data })`** — Auto-populates `user_id`
- **`getReadingPlan(id)`**, **`updateReadingPlan(id, data)`**, **`deleteReadingPlan(id)`** — Standard CRUD
- **`listReadingPlans()`** — Returns all plans sorted by `-created_at`

**Progress tracking:**
- **`markDayComplete(planId, dayNumber)`** — Toggle-style: creates a progress record if none exists, toggles `completed` if one does. Handles concurrent unique-constraint violations gracefully by fetching and toggling the conflicting record.
- **`getPlanProgress(planId)`** — Returns all progress records for a plan, sorted by `day_number`
- **`getAllProgressRecords()`** — Returns all progress records across all plans (for dashboard aggregation)
- **`getPlanCompletionPercentage(planId)`** — Calculates `(completedDays / totalDays) × 100`, rounded

**Seed/import:**
- **`importReadingPlan(planData, startDate?)`** — Creates a plan from seed JSON data, optionally setting start_date to today

### `revelations.ts` — Revelation CRUD
Collection: `revelations`. Functions:

- **`createRevelation({ content, date? })`** — Date defaults to today if not provided; auto-populates `user_id`
- **`getRevelation(id)`**, **`updateRevelation(id, data)`**, **`deleteRevelation(id)`** — Standard CRUD
- **`listRevelations(params?)`** — Paginated list with filters: `date_from`, `date_to`, `search`. Sorted by `-date`.

### `export-import.ts` — Full data portability
Provides complete backup and restore of all user data.

- **`exportAllData(): Promise<ExportData>`** — Fetches all bible notes, small group notes, sermons, and revelations for the authenticated user. Runs queries in parallel with `Promise.all`. Returns an `ExportData` object with `exported_at` timestamp.

- **`importData(data: ExportData): Promise<ImportResult>`** — Iterates through each entity array, calling the respective `create*` function. Collects per-item errors without failing the entire import. Returns counts of successfully imported items plus error messages.

- **`ExportData`** type — Contains `exported_at` + arrays of all four entity types.
- **`ImportResult`** type — Contains per-entity success counts + `errors: string[]`.

### `index.ts` — Barrel module
Re-exports all public symbols from every module for convenient single-import access. Exports every function and type used by the application.

## Integration
- **Depended on by:** `apps/web` (server actions, form handlers, data components)
- **Depends on:** `@bible-notes/shared` (types), `pocketbase` (underlying SDK), `./client.ts` (singleton access)

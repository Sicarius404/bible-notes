# Design Spec: Bible Notes Title + Collapsible List + Mobile Pagination

**Date:** 2026-04-30
**Status:** Approved

---

## Problem Statement

1. Bible notes in the list view are displayed with their full content preview stacked on top of one another, making the list visually cluttered and hard to scan.
2. There is no way for users to give a note a custom title.
3. The mobile app does not paginate notes, loading all notes at once.

## Goals

- Add a **required `title`** field to every Bible note.
- Redesign the list view to show **title + verse references + date** first, with the content hidden behind a collapsible expand action.
- Add **pagination** to the mobile notes list.
- Keep full-text search working across title, verse refs, and content.

---

## Approach

**Collapsible / Accordion List (Approach B)** — chosen because it is the most mobile-friendly. It keeps the list compact for scanning while letting users expand any note inline to read the full content without navigating away.

---

## Architecture

### 1. Data Layer

#### PocketBase Schema Change
- Add `title` field to the `bible_notes` collection:
  - Type: `text`
  - Required: `true`
  - Max length: `255`
  - Present in create/update API and list filters.
- Create a new migration file `002_add_title_to_bible_notes.js` that:
  - Adds the `title` field.
  - Back-fills existing notes with a generated title (first verse ref or first 40 chars of content).

#### Shared Types & Validation
- `BibleNote` interface: add `title: string`.
- `bibleNoteSchema` (Zod): add `title: z.string().min(1, 'Title is required')`.
- `BibleNoteSearchParams`: search query already scans `content`; ensure `title` is also included in the PocketBase search filter.

### 2. Web Frontend

#### Create Note (`/bible-notes/new`)
- Add **Title** input at the top of the form, required.

#### Edit Note (`/bible-notes/[id]`)
- Add **Title** input, pre-filled with existing value.

#### List Page (`/bible-notes`)
- Each card shows:
  - **Title** (prominent heading)
  - **Verse refs** (badges)
  - **Date**
  - **Expand/Collapse chevron**
- Clicking a card toggles an inline expansion that reveals the full `content`.
- Pagination remains at 10 per page (already implemented).

#### Dashboard (`/`)
- Recent Notes cards: show **title** instead of content preview.

### 3. Mobile Frontend

#### Create Note (`/bible-notes/new`)
- Add **Title** text input at the top, required.

#### Edit Note (`/bible-notes/[id]`)
- Add **Title** text input.

#### List Screen (`(tabs)/bible-notes`)
- Each card shows:
  - **Title** (heading)
  - **Verse refs** (comma-separated or badges)
  - **Date**
- Tapping a card expands inline to show full content using `LayoutAnimation`.
- **Pagination:** fetch 10 per page. Show a **"Load More"** button at the bottom of the list.

### 4. Export / Import
- `export-import.ts`: include `title` in exported JSON.
- Import: validate `title` presence; if missing, skip the record or auto-generate one.

---

## UI/UX Details

### Web List Card
```
┌─────────────────────────────────────┐
│ The Power of Grace              [▼] │ ← title + chevron
│ [John 3:16] [Romans 5:8]            │ ← verse badges
│ May 1, 2026                         │ ← date
├─────────────────────────────────────┤
│ For God so loved the world...       │ ← expanded content
│ (full note text)                    │
└─────────────────────────────────────┘
```

### Mobile List Card
```
┌─────────────────────────────┐
│ The Power of Grace          │ ← title
│ John 3:16, Romans 5:8       │ ← verse refs
│ May 1, 2026                 │ ← date
└─────────────────────────────┘
   ↓ tap expands inline
```

### Search Behavior
- The existing `search` param on `listBibleNotes()` should filter across `title`, `verse_refs`, and `content`.

---

## Testing Notes

- Verify creating a note without a title shows a validation error.
- Verify existing notes get a back-filled title after migration.
- Verify expand/collapse works on web and mobile.
- Verify mobile "Load More" fetches the next page correctly.
- Verify export includes `title` and import handles it.

---

## Files to Modify

| File | Change |
|------|--------|
| `server/pb_migrations/002_add_title_to_bible_notes.js` | New migration |
| `packages/shared/src/types.ts` | Add `title` to `BibleNote` |
| `packages/shared/src/validation.ts` | Add `title` to `bibleNoteSchema` |
| `packages/pocketbase-client/src/bible-notes.ts` | Include `title` in CRUD; update search filter |
| `packages/pocketbase-client/src/export-import.ts` | Handle `title` in export/import |
| `apps/web/src/app/(app)/bible-notes/new/page.tsx` | Add title input |
| `apps/web/src/app/(app)/bible-notes/[id]/page.tsx` | Add title input |
| `apps/web/src/app/(app)/bible-notes/page.tsx` | Collapsible cards, show title |
| `apps/web/src/app/(app)/page.tsx` | Show title in Recent Notes |
| `apps/mobile/app/bible-notes/new.tsx` | Add title input |
| `apps/mobile/app/bible-notes/[id].tsx` | Add title input |
| `apps/mobile/app/(tabs)/bible-notes.tsx` | Collapsible cards, pagination |

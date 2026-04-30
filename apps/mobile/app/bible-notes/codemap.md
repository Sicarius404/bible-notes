# apps/mobile/app/bible-notes/

## Responsibility

Bible Notes CRUD feature screens. Allows users to view, create, edit, and delete individual Bible notes with date, verse references, and content.

## Files

- **new.tsx** — Create Bible Note form. Fields: Date (defaults to today), Verse References (comma-separated string input, converted to array), Content (multiline text area). Validates content is non-empty. Calls `createBibleNote()` then navigates back.
- **[id].tsx** — Bible Note detail/edit screen. Uses `useLocalSearchParams()` to get the note `id`. Loads full note via `getBibleNote(id)`. Supports two modes:
  - **View mode:** Displays verse references, date, divider, content, and Edit/Delete buttons.
  - **Edit mode:** Same form structure as `new.tsx` but pre-populated with existing values. Calls `updateBibleNote()` to save.
  - **Delete:** Shows confirmation `Alert`, then calls `deleteBibleNote()` and navigates back.
  - Loading spinner while fetching, "Note not found" fallback.

## Integration

- **Depends on:** `@bible-notes/pocketbase-client` (`createBibleNote`, `getBibleNote`, `updateBibleNote`, `deleteBibleNote`), `@bible-notes/shared` (`BibleNote` type), `./components/ui` (`Input`, `Button`, `Screen`), `./theme` for design tokens.
- **Used by:** Tab screen `app/(tabs)/bible-notes.tsx` navigates here via `router.push('/bible-notes/new')` and `router.push('/bible-notes/${id}')`. Home screen `app/(tabs)/index.tsx` also links to recent notes' detail screens.
- **Route pattern:** `new.tsx` and `[id].tsx` are automatically routed by Expo Router at `/bible-notes/new` and `/bible-notes/:id`.

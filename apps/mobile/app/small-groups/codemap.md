# apps/mobile/app/small-groups/

## Responsibility

Small Groups feature screens. Allows users to document small group meetings with topic, date, attendees, and content notes, with full CRUD.

## Files

- **new.tsx** — Create Small Group Note form. Fields: Date (defaults to today), Topic, Attendees (free text names), Content (multiline). Validates topic and content are non-empty. Calls `createSmallGroupNote()` and navigates back. Uses custom `Input`, `Button`, `Screen` components.
- **[id].tsx** — Small Group Note detail/edit screen. Loads via `getSmallGroupNote(id)`. View mode displays topic, date, attendees, content with section labels, and Edit/Delete buttons. Edit mode has inline fields for all four properties. Uses raw React Native `TextInput` and `Button` components.

## Integration

- **Depends on:** `@bible-notes/pocketbase-client` (`createSmallGroupNote`, `getSmallGroupNote`, `updateSmallGroupNote`, `deleteSmallGroupNote`), `@bible-notes/shared` (`SmallGroupNote` type), `./components/ui` (`Input`, `Button`, `Screen`), `./theme`.
- **Used by:** Tab screen `app/(tabs)/small-groups.tsx` navigates here via FAB and card taps.
- **Note:** This tab is hidden from the tab bar (`href: null` in `_layout.tsx`), so users navigate here via deep links or the home screen only. The `[id].tsx` detail screen uses raw RN components (inconsistent with `new.tsx`).

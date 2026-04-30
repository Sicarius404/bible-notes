# apps/mobile/app/revelations/

## Responsibility

Revelations feature screens. Allows users to capture spiritual revelations with date and content, with view/edit/delete capabilities.

## Files

- **new.tsx** — Create Revelation form. Fields: Date (defaults to today), Content (multiline). Validates content is non-empty. Calls `createRevelation()` and navigates back. Standard form pattern matching other feature screens.
- **[id].tsx** — Revelation detail/edit screen. Loads via `getRevelation(id)`, supports view and edit modes toggling. Edit form with Date and Content fields. Delete with confirmation `Alert`. Uses raw `TextInput` and `Button` components (not custom UI components).

## Integration

- **Depends on:** `@bible-notes/pocketbase-client` (`createRevelation`, `getRevelation`, `updateRevelation`, `deleteRevelation`), `@bible-notes/shared` (`Revelation` type), `./components/ui` (`Input`, `Button`, `Screen`), `./theme` for design tokens.
- **Used by:** Tab screen `app/(tabs)/revelations.tsx` (list + inline quick-create form) and home screen quick action button navigate here.
- **Note:** The detail screen (`[id].tsx`) uses raw RN `TextInput`/`Button` and inline styles rather than the custom UI component library — inconsistent with `new.tsx` which uses custom components.

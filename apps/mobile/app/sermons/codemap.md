# apps/mobile/app/sermons/

## Responsibility

Sermons feature screens. Allows users to log sermon notes with title, pastor, campus, service type, date, and content, with full CRUD.

## Files

- **new.tsx** — Create Sermon form. Fields: Date, Title, Pastor, Campus, Service Type (segmented button row: Morning/Evening/Special using `SERVICE_TYPE_LABELS`), Content (multiline). Validates title and pastor are non-empty. Calls `createSermon()` and navigates back. Uses custom `Input`, `Button`, `Screen` components.
- **[id].tsx** — Sermon detail/edit screen. Loads via `getSermon(id)`. View mode displays title, pastor · campus · service type badge, date, content, and Edit/Delete buttons. Edit mode has inline date, title, pastor, campus, service type (via `<Button>` color toggle), and content fields. Uses raw React Native `TextInput` and `Button` components — notably different from `new.tsx` which uses custom UI components.

## Integration

- **Depends on:** `@bible-notes/pocketbase-client` (`createSermon`, `getSermon`, `updateSermon`, `deleteSermon`), `@bible-notes/shared` (`Sermon`, `ServiceType` types; `SERVICE_TYPE_LABELS`, `SERVICE_TYPES` constants), `./components/ui` (`Input`, `Button`, `Screen`), `./theme`.
- **Used by:** Tab screen `app/(tabs)/sermons.tsx` and home screen quick action navigate here.
- **TODO/inconsistency:** `[id].tsx` imports `Button` from `react-native` (not custom) and uses inline styles without theme tokens — this should be refactored to match the custom component pattern used in `new.tsx`.

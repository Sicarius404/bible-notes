# apps/mobile/app/reading-plans/

## Responsibility

Reading Plans feature screens. Allows users to create structured Bible reading plans with daily passage assignments, view progress, and mark days as complete.

## Files

- **new.tsx** — Create Reading Plan form. Fields: Name, Total Days (number input that dynamically generates day entries), Start Date. Daily passages are entered as comma-separated text per day. The `syncDayCount()` function adjusts the day entries array when the total days value changes. Constructs `ReadingPlanDay[]` array and calls `createReadingPlan()`.
  - Notable: Uses a `DayEntry` interface with a synthetic `key` (incrementing counter) for stable React list rendering, plus a `day` number and `passages` string field.
- **[id].tsx** — Reading Plan detail screen. Loads plan data and progress (completed days) in parallel via `getReadingPlan()` and `getPlanProgress()`. Displays plan name, metadata, and a scrollable list of day cards. Each day card is tappable — toggles completion via `markDayComplete()` and updates local `Set<number>` state. Includes a "Delete Plan" button with confirmation `Alert`.
  - Day cards show: day number, passage references, and a green checkmark when completed. Completed cards have a green background (`#dcfce7`).

## Integration

- **Depends on:** `@bible-notes/pocketbase-client` (`createReadingPlan`, `getReadingPlan`, `getPlanProgress`, `markDayComplete`, `deleteReadingPlan`), `@bible-notes/shared` (`ReadingPlan`, `ReadingPlanDay` types), `./components/ui` (`Input`, `Button`, `Screen`), `./theme` for design tokens.
- **Used by:** Tab screen `app/(tabs)/reading-plans.tsx` lists all plans and navigates here.
- **Note:** The detail screen (`[id].tsx`) uses raw React Native `TextInput`/`Button` components directly rather than the custom UI components, and its styles are inline/external rather than using theme tokens — a minor inconsistency in the codebase.

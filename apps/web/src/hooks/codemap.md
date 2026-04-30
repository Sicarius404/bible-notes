# apps/web/src/hooks/

## Responsibility
Custom React hooks shared across the application. Currently contains a single utility hook for debouncing values.

## Design
- **Minimal surface**: Hooks are extracted here when needed by multiple pages/components. So far only `useDebounce` has warranted extraction.
- **Generic typing**: The `useDebounce` hook is fully generic (`<T>`) and can debounce any value type.

## Files
- `use-debounce.ts` — Generic debounce hook. Accepts a value of type `T` and a delay in milliseconds. Returns the debounced value after the specified delay. Uses `useState` + `useEffect` with `setTimeout`/`clearTimeout`. Used extensively in list pages (bible-notes, sermons, revelations, small-groups) to debounce search inputs with a 300ms delay.

## Integration
- **Depends on**: React (`useState`, `useEffect`)
- **Consumed by**: List pages in `app/(app)/` for debouncing search/filter inputs

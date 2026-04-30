# apps/mobile/components/

## Responsibility

Shared React component library for the mobile app. Contains the authentication context provider and a reusable UI component kit.

## Files

- **auth-provider.tsx** — Authentication context provider using React Context. Exports:
  - `AuthProvider` — Wraps the app, initializes user state from `getCurrentUser()` on mount, provides `user` (AuthUser | null), `isLoading` (boolean), and `logout()` (async function).
  - `useAuth()` — Hook to consume auth context from any descendant component.
  - Used by `app/_layout.tsx` to provide auth state to the entire app, and by `app/(tabs)/_layout.tsx` to display the user's name and handle logout.
- **ui/** — Reusable UI component library (Button, Card, Input, Screen). See `ui/codemap.md` for details.

## Integration

- **Depends on:** `@bible-notes/pocketbase-client` (`getCurrentUser`, `isAuthenticated`, `logOut`), `@bible-notes/pocketbase-client` types (`AuthUser`), `./theme` for UI component styling.
- **Consumed by:** All screen files throughout `app/` import from `../components/ui`. Auth screens and tab layouts use `useAuth()` from `auth-provider.tsx`.
- **Design pattern:** The UI kit exports barrel-style through `ui/index.ts`. Components accept standard props (onPress, variant, disabled, etc.) and use the theme's design tokens for consistent styling.

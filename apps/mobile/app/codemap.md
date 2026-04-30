# apps/mobile/app/

## Responsibility

Root routing layer for the Expo Router app. Defines the top-level navigation structure: an authenticated tab layout for logged-in users and standalone auth screens (login/signup).

## Files

- **\_layout.tsx** — Root layout that wraps the entire app in `SafeAreaProvider` and `AuthProvider`. Uses a `<Stack>` navigator with three screens:
  - `(tabs)` — The tab-based main app (no header shown)
  - `login` — Login screen
  - `signup` — Signup screen
  - Header is globally hidden (`headerShown: false`), background color uses theme `colors.background`.
- **login.tsx** — Login screen with email/password form, validation, error display, and redirect to home on successful auth. Styled with primary navy background and a rounded white form card at the bottom. Auto-redirects if already authenticated.
- **signup.tsx** — Registration screen with name/email/password fields, matching visual style to login. Redirects to home on success.

## Integration

- **Depends on:** `AuthProvider` from `./components/auth-provider`, theme tokens from `./theme`, `@bible-notes/pocketbase-client` for `logIn`, `signUp`, `isAuthenticated`.
- **Used by:** The Expo Router entry point (`expo-router/entry`). All mobile traffic flows through this root layout.
- **Navigation flow:** Unauthenticated users land on `/login` or `/signup`. On successful auth, they're redirected to `/(tabs)` which loads the main app.
- **Route convention:** `(tabs)` is a route group — its children render as children of the tab navigator, not as separate stack screens.

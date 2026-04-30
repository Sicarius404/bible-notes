# Password Visibility Toggle Design

**Date:** 2025-04-30
**Feature:** Add a password visibility toggle (eye icon) to password inputs on login and signup pages.

## Overview
Add a reusable `PasswordInput` component that allows users to toggle between showing and hiding their password. Applied to the login and signup pages.

## Component: `PasswordInput`

### Location
`apps/web/src/components/ui/password-input.tsx`

### Behavior
- Wraps the existing `Input` component.
- Manages `showPassword` state internally with `useState`.
- Renders the password field and a toggle button (eye icon) inside a relative container.
- The toggle button is absolutely positioned at the right end of the input.
- Toggles the input `type` between `"password"` and `"text"`.

### Props
- Accepts all standard `InputProps` except `type` (forced internally).
- Exposes `className` and all other input attributes for flexibility.

### Iconography
- Uses `lucide-react` icons: `Eye` and `EyeOff` (already a project dependency).

### Accessibility
- Toggle button has `aria-label="Show password"` / `"Hide password"` depending on state.
- Toggle button uses `type="button"` to prevent accidental form submission.

### Styling
- Toggle button is styled with muted colors (`text-muted-foreground`).
- Input has `pr-10` padding so text never overlaps the icon.
- Matches existing shadcn/ui aesthetic.

## Pages Updated
1. `apps/web/src/app/(auth)/login/page.tsx` — replace password `Input` with `PasswordInput`.
2. `apps/web/src/app/(auth)/signup/page.tsx` — replace both `password` and `confirmPassword` `Input`s with `PasswordInput`.

## Why Not Other Options
- **Inline state per page:** Duplicated logic, harder to maintain.
- **Hook-based approach:** More boilerplate per usage for this simple need.
- **Reusable component:** DRY, consistent UX, easy to extend, aligns with shadcn/ui patterns.

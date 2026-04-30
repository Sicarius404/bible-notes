# apps/web/src/app/(auth)/

## Responsibility
Public authentication pages. Contains login, signup, and forgot-password flows. These pages are not protected by the auth middleware (the middleware explicitly allows `/login` and `/signup` paths).

## Design
- **Centered card layout**: A shared `layout.tsx` renders all auth pages inside a centered card with a gradient background, subtle atmospheric glow, and the "Bible Notes" branding header.
- **Self-contained auth**: Uses `useAuth()` from `pocketbase-provider` (wraps PocketBase auth SDK). The provider stores auth state and the `pb_auth` cookie.
- **Redirect support**: Login page reads `redirect` search param to navigate the user back to their intended page after login.
- **Client-side**: All pages are `'use client'` with `useState` for form state (no `react-hook-form` — these are simple forms).
- **Error handling**: Inline error messages shown in styled alert boxes. No toast notifications.

## Pages

### Login (`/login`)
- Email and password fields
- "Forgot password?" link
- Sign In button with loading state
- Redirects to `?redirect=` param (or `/`) on success
- Sign up link at bottom
- Wrapped in `<Suspense>` for `useSearchParams()` compatibility

### Signup (`/signup`)
- Name, email, password, confirm password fields
- Validates password match and minimum 8 characters client-side
- Calls `useAuth().signup()` then redirects to `/`
- Catches and displays PocketBase error messages
- Sign in link at bottom

### Forgot Password (`/forgot-password`)
- Email field
- Sends password reset via `requestPasswordReset()` from the pocketbase client
- Shows success message ("If an account exists with this email, you will receive a password reset link")
- Back to sign in link
- Rate-limit safe: doesn't reveal whether email exists

## Files
- `layout.tsx` — Auth layout: gradient background, centered card wrapper, "Bible Notes" branding
- `login/page.tsx` — Sign-in form with redirect support
- `signup/page.tsx` — Registration form with validation
- `forgot-password/page.tsx` — Password reset request form

## Integration
- **Depends on**: `components/pocketbase-provider` for `useAuth()` (login, signup), `@bible-notes/pocketbase-client` for `requestPasswordReset()`, shadcn/ui components (`Card`, `Input`, `Button`)
- **Consumed by**: Unauthenticated users via browser at `/login`, `/signup`, `/forgot-password`

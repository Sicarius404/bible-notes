# Password Visibility Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable `PasswordInput` component with an eye-icon toggle to show/hide passwords, and use it on the login and signup pages.

**Architecture:** A single reusable UI component (`PasswordInput`) wraps the existing shadcn `Input` and manages its own show/hide state. The toggle button is absolutely positioned inside a relative container. Login and signup pages swap their plain password `Input`s for this new component.

**Tech Stack:** React, TypeScript, Tailwind CSS, shadcn/ui, lucide-react

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `apps/web/src/components/ui/password-input.tsx` | Create | Reusable password input with built-in visibility toggle |
| `apps/web/src/app/(auth)/login/page.tsx` | Modify | Replace password `Input` with `PasswordInput` |
| `apps/web/src/app/(auth)/signup/page.tsx` | Modify | Replace `password` and `confirmPassword` `Input`s with `PasswordInput` |

---

### Task 1: Create `PasswordInput` component

**Files:**
- Create: `apps/web/src/components/ui/password-input.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input, InputProps } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/ui/password-input.tsx
git commit -m "feat(ui): add PasswordInput component with visibility toggle"
```

---

### Task 2: Update login page

**Files:**
- Modify: `apps/web/src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Add import and swap component**

Replace the password input block in `apps/web/src/app/(auth)/login/page.tsx`.

Add the import near the top:
```tsx
import { PasswordInput } from '@/components/ui/password-input'
```

Change the password input from:
```tsx
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
```

To:
```tsx
            <PasswordInput
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/(auth)/login/page.tsx
git commit -m "feat(auth): use PasswordInput on login page"
```

---

### Task 3: Update signup page

**Files:**
- Modify: `apps/web/src/app/(auth)/signup/page.tsx`

- [ ] **Step 1: Add import and swap components**

Replace the password and confirm password input blocks in `apps/web/src/app/(auth)/signup/page.tsx`.

Add the import near the top:
```tsx
import { PasswordInput } from '@/components/ui/password-input'
```

Change the password input from:
```tsx
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
```

To:
```tsx
            <PasswordInput
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
```

Change the confirm password input from:
```tsx
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
```

To:
```tsx
            <PasswordInput
              id="confirmPassword"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/(auth)/signup/page.tsx
git commit -m "feat(auth): use PasswordInput on signup page"
```

---

### Task 4: Verification

- [ ] **Step 1: Run TypeScript check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 2: Manual visual verification checklist**

1. Start the dev server (`pnpm dev` from repo root).
2. Navigate to `/login`.
3. Confirm the password field shows an eye icon on the right.
4. Click the eye icon — the password should become visible (type="text").
5. Click again — the password should be hidden (type="password").
6. Navigate to `/signup`.
7. Repeat checks for both Password and Confirm Password fields.
8. Confirm form submission still works correctly.

---

## Self-Review

**1. Spec coverage:**
- Reusable component wrapping `Input` → Task 1
- Manages `showPassword` state → Task 1
- Toggle button with `Eye` / `EyeOff` icons → Task 1
- `aria-label` accessibility → Task 1
- `pr-10` padding to prevent text overlap → Task 1
- Login page updated → Task 2
- Signup page updated (both fields) → Task 3
- Styling matches shadcn/ui → Task 1

**2. Placeholder scan:** No TBDs, TODOs, or vague steps found.

**3. Type consistency:** `PasswordInput` uses `InputProps` from the existing `Input` component. Props forwarded correctly. No type mismatches.

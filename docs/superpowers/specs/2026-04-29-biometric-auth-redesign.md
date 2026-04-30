# Mobile Biometric Authentication Redesign Spec

**Date:** 2026-04-29  
**Scope:** `apps/mobile` — Login screen, Settings screen, Biometric auth library  
**Goal:** Redesign fingerprint login flow to be explicit, user-controlled, and reliable.

---

## 1. User Journey

### 1.1 First-Time Login (No fingerprint set up)
1. User enters email + password
2. Taps **"Sign In"**
3. Login succeeds
4. **Modal appears:** "Enable fingerprint for faster login?" — Your credentials will be stored securely on this device.
   - **"Enable"** → Prompts fingerprint → Stores credentials → Redirects to app
   - **"Not Now"** → Redirects to app, no credentials stored

### 1.2 Return Visit (Fingerprint is set up)
Login screen shows two distinct options stacked vertically:

```
[Email input]
[Password input]
[Sign In]

────────── or ──────────

[Sign in with fingerprint]
```

- User taps **"Sign in with fingerprint"**
- Fingerprint prompt appears
- Success → Auto-login with stored credentials → Redirect to app
- Cancelled → Stay on login screen

### 1.3 Return Visit (Fingerprint NOT set up)
The "Sign in with fingerprint" button is **hidden** or shows a disabled state.
Only password login is available.

### 1.4 Settings
- **Toggle: "Fingerprint Login"**
- **ON (no credentials):** Password modal → verify → fingerprint prompt → save credentials
- **ON (has credentials):** Just set the flag
- **OFF:** Clear stored credentials + disable flag

---

## 2. UI States on Login Screen

| State | UI |
|-------|-----|
| No biometric hardware | Only password login shown |
| Biometric available, no stored credentials | Password login + subtle hint text: "Log in with password to enable fingerprint" |
| Biometric available, has stored credentials | Password login + **prominent** "Sign in with fingerprint" button |
| Fingerprint prompt active | Native OS biometric overlay (handled by expo-local-authentication) |

---

## 3. Technical Architecture

### 3.1 Biometric Auth Library (`lib/biometric-auth.ts`)
Clean API surface:

```typescript
// Checks
isBiometricAvailable(): Promise<boolean>
hasStoredCredentials(): Promise<boolean>

// Credential storage
saveCredentials(email, password): Promise<void>
getCredentials(): Promise<StoredCredentials | null>
clearCredentials(): Promise<void>

// Biometric prompt
promptBiometricLogin(): Promise<LocalAuthenticationResult>
promptBiometricSetup(): Promise<LocalAuthenticationResult>

// Session
updateSessionTimestamp(): Promise<void>
isSessionValid(): Promise<boolean>
```

**Remove:** `isBiometricEnabled()` / `setBiometricEnabled()` — The existence of stored credentials IS the enabled state. The settings toggle is just a UI convenience that clears/re-saves credentials.

### 3.2 Auth Provider (`components/auth-provider.tsx`)
Expose biometric readiness state:

```typescript
interface AuthContext {
  user: AuthUser | null
  isLoading: boolean
  biometricAvailable: boolean
  hasStoredCredentials: boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}
```

On init: check biometric availability + credential presence.
On logout: always clear stored credentials.

### 3.3 Login Screen (`app/login.tsx`)
**Two login paths:**

1. **Password path:** Email input → Password input → "Sign In" → On success, show enable-fingerprint modal (if biometric available AND no stored credentials)
2. **Fingerprint path:** "Sign in with fingerprint" button → Prompt biometric → On success, login with stored credentials → Update session → Redirect

**Error handling:**
- Invalid stored credentials (password changed) → Clear credentials → Show error: "Password changed. Please log in with your password." → Hide fingerprint button
- Biometric cancelled → Stay on screen, no error
- Biometric error → Show error: "Fingerprint unavailable. Please use your password."

### 3.4 Settings Screen (`app/settings.tsx`)
**Toggle flow:**
- Toggle ON: If no credentials stored → show password modal → verify → fingerprint prompt → save credentials → show success
- Toggle OFF: Clear credentials → show success

---

## 4. Error Handling & Edge Cases

| Scenario | Behavior |
|----------|----------|
| Password changed after fingerprint setup | Fingerprint login fails with "Invalid credentials" → Auto-clear stored credentials → Force password login |
| User deletes app data / reinstalls | Credentials lost → Normal first-time flow |
| Biometric hardware becomes unavailable | Hide fingerprint button → Require password |
| Fingerprint enrolment removed | `isBiometricAvailable()` returns false → Hide fingerprint button |
| Session expired (7 days) | Still allow fingerprint login — fingerprint IS the re-auth. Session duration is for auto-redirect convenience only. |
| Network error during fingerprint login | Show "Network error. Please try again." — Don't clear credentials |

---

## 5. Implementation Plan

### Phase 1: Refactor biometric-auth.ts
- Simplify API: remove enabled flag, keep only credentials + session
- Add robust error logging

### Phase 2: Update auth-provider.tsx
- Remove `biometricEnabled` / `sessionValid` from context
- Keep only `biometricAvailable` and `hasStoredCredentials`
- Ensure logout clears credentials

### Phase 3: Redesign login.tsx
- Split into password path and fingerprint path
- Add first-time enable modal
- Add fingerprint button with proper conditional rendering

### Phase 4: Update settings.tsx
- Simplify toggle to just manage credential presence
- Remove session-valid-dependent logic

### Phase 5: Remove app.json plugin config if not needed
- Actually, keep it — iOS Face ID still needs the permission string.

---

## 6. Testing Checklist

- [ ] First login shows enable-fingerprint modal
- [ ] "Not Now" dismisses modal, no credentials stored
- [ ] "Enable" prompts fingerprint, stores credentials, redirects
- [ ] Return visit shows "Sign in with fingerprint" button
- [ ] Fingerprint login works and redirects
- [ ] Fingerprint cancel stays on login screen
- [ ] Invalid credentials auto-clear and show error
- [ ] Settings toggle OFF clears credentials
- [ ] Settings toggle ON with no credentials prompts password
- [ ] Logout clears credentials
- [ ] iOS Face ID permission dialog shows correct message

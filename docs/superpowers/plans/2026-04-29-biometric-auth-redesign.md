# Mobile Biometric Authentication Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the mobile fingerprint login flow to be explicit, user-controlled, and reliable.

**Architecture:** Simplify biometric state to "credentials stored vs not stored." Remove the separate `biometric_enabled` flag. The login screen offers two distinct paths: password login and fingerprint login. First successful password login prompts to enable fingerprint.

**Tech Stack:** Expo SDK 54, React Native 0.81, expo-local-authentication, expo-secure-store, TypeScript

---

## File Map

| File | Responsibility |
|------|---------------|
| `apps/mobile/lib/biometric-auth.ts` | Native biometric API wrapper + secure credential storage. Simplified API. |
| `apps/mobile/components/auth-provider.tsx` | Auth context. Exposes `biometricAvailable` and `hasStoredCredentials`. |
| `apps/mobile/app/login.tsx` | Login screen. Two paths: password login + fingerprint login. |
| `apps/mobile/app/settings.tsx` | Settings screen. Toggle manages credential presence. |

---

## Task 1: Refactor `lib/biometric-auth.ts`

**Files:**
- Modify: `apps/mobile/lib/biometric-auth.ts`

**Goal:** Simplify API. Remove `biometric_enabled` flag. The presence of stored credentials IS the enabled state.

- [ ] **Step 1: Rewrite the entire file**

```typescript
import * as LocalAuthentication from 'expo-local-authentication'
import * as SecureStore from 'expo-secure-store'

const CREDENTIALS_KEY = 'biometric_credentials'
const LAST_AUTH_KEY = 'last_auth_timestamp'
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

interface StoredCredentials {
  email: string
  password: string
}

export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync()
    if (!compatible) {
      console.log('[biometric] Hardware not compatible')
      return false
    }
    const enrolled = await LocalAuthentication.isEnrolledAsync()
    console.log('[biometric] Enrolled:', enrolled)
    return enrolled
  } catch (err) {
    console.error('[biometric] isBiometricAvailable error:', err)
    return false
  }
}

export async function hasStoredCredentials(): Promise<boolean> {
  const creds = await getCredentials()
  return creds !== null
}

export async function saveCredentials(email: string, password: string): Promise<void> {
  const data: StoredCredentials = { email, password }
  await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify(data))
}

export async function getCredentials(): Promise<StoredCredentials | null> {
  const value = await SecureStore.getItemAsync(CREDENTIALS_KEY)
  if (!value) return null
  try {
    return JSON.parse(value) as StoredCredentials
  } catch {
    return null
  }
}

export async function clearCredentials(): Promise<void> {
  await SecureStore.deleteItemAsync(CREDENTIALS_KEY)
  await SecureStore.deleteItemAsync(LAST_AUTH_KEY)
}

export async function updateSessionTimestamp(): Promise<void> {
  await SecureStore.setItemAsync(LAST_AUTH_KEY, Date.now().toString())
}

export async function isSessionValid(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(LAST_AUTH_KEY)
  if (!value) return false
  const lastAuth = parseInt(value, 10)
  if (isNaN(lastAuth)) return false
  return Date.now() - lastAuth < SESSION_DURATION_MS
}

export async function promptBiometricLogin(): Promise<LocalAuthentication.LocalAuthenticationResult> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Sign in with your fingerprint',
      cancelLabel: 'Use password',
      fallbackLabel: 'Use password',
      disableDeviceFallback: false,
    })
    console.log('[biometric] promptBiometricLogin result:', result)
    return result
  } catch (err) {
    console.error('[biometric] promptBiometricLogin error:', err)
    throw err
  }
}

export async function promptBiometricSetup(): Promise<LocalAuthentication.LocalAuthenticationResult> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Confirm with your fingerprint to enable faster login',
      cancelLabel: 'Not now',
      fallbackLabel: 'Use password',
      disableDeviceFallback: false,
    })
    console.log('[biometric] promptBiometricSetup result:', result)
    return result
  } catch (err) {
    console.error('[biometric] promptBiometricSetup error:', err)
    throw err
  }
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd apps/mobile && npx tsc --noEmit`
Expected: No errors

---

## Task 2: Update `components/auth-provider.tsx`

**Files:**
- Modify: `apps/mobile/components/auth-provider.tsx`

**Goal:** Remove `biometricEnabled`, `sessionValid`, `isBiometricReady`. Keep only `biometricAvailable` and `hasStoredCredentials`. Logout always clears credentials.

- [ ] **Step 1: Rewrite the entire file**

```typescript
import { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, logOut } from '@bible-notes/pocketbase-client'
import type { AuthUser } from '@bible-notes/pocketbase-client'
import {
  isBiometricAvailable,
  hasStoredCredentials,
  clearCredentials,
} from '../lib/biometric-auth'

const AuthContext = createContext<{
  user: AuthUser | null
  isLoading: boolean
  biometricAvailable: boolean
  hasStoredCredentials: boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}>({
  user: null,
  isLoading: true,
  biometricAvailable: false,
  hasStoredCredentials: false,
  logout: async () => {},
  refreshUser: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [hasCreds, setHasCreds] = useState(false)

  const refreshBiometricState = async () => {
    try {
      const available = await isBiometricAvailable()
      const creds = available ? await hasStoredCredentials() : false
      setBiometricAvailable(available)
      setHasCreds(creds)
    } catch (err: any) {
      console.error('[auth-provider] refreshBiometricState error:', err)
      setBiometricAvailable(false)
      setHasCreds(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        const current = getCurrentUser()
        setUser(current)
        await refreshBiometricState()
      } catch (err: any) {
        console.error('[auth-provider] init error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  const refreshUser = async () => {
    const current = getCurrentUser()
    setUser(current)
    await refreshBiometricState()
  }

  const logout = async () => {
    await logOut()
    await clearCredentials()
    setUser(null)
    setHasCreds(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        biometricAvailable,
        hasStoredCredentials: hasCreds,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd apps/mobile && npx tsc --noEmit`
Expected: No errors

---

## Task 3: Redesign `app/login.tsx`

**Files:**
- Modify: `apps/mobile/app/login.tsx`

**Goal:** Two login paths. Password login first. After first successful password login, show "Enable fingerprint?" modal. If credentials stored, show "Sign in with fingerprint" button.

- [ ] **Step 1: Update imports and state**

Replace the current imports section (lines 1-31) with:

```typescript
import { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { logIn } from '@bible-notes/pocketbase-client'
import { router } from 'expo-router'
import { Button, Input, Screen } from '../components/ui'
import { useAuth } from '../components/auth-provider'
import { colors, spacing, typography, shadows, radius } from '../theme'
import { BookOpen, Mail, Lock, Fingerprint } from 'lucide-react-native'
import {
  isBiometricAvailable,
  hasStoredCredentials,
  getCredentials,
  promptBiometricLogin,
  promptBiometricSetup,
  saveCredentials,
  updateSessionTimestamp,
  clearCredentials,
} from '../lib/biometric-auth'

const { width } = Dimensions.get('window')
```

- [ ] **Step 2: Replace the LoginScreen component body**

Replace the entire component (from `export default function LoginScreen` to end of file, excluding styles) with:

```typescript
export default function LoginScreen() {
  const { refreshUser, biometricAvailable } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showEnableModal, setShowEnableModal] = useState(false)
  const [hasCreds, setHasCreds] = useState(false)

  useEffect(() => {
    const check = async () => {
      const available = await isBiometricAvailable()
      if (available) {
        const creds = await hasStoredCredentials()
        setHasCreds(creds)
      }
    }
    check()
  }, [])

  const attemptFingerprintLogin = async () => {
    const creds = await getCredentials()
    if (!creds) {
      setError('No saved credentials. Please log in with your password first.')
      setHasCreds(false)
      return
    }

    try {
      const result = await promptBiometricLogin()
      if (!result.success) {
        console.log('[login] Fingerprint cancelled or failed:', result)
        if ('error' in result && result.error) {
          setError(`Fingerprint error: ${result.error}`)
        }
        return
      }

      setLoading(true)
      await logIn(creds.email, creds.password)
      await updateSessionTimestamp()
      await refreshUser()
      router.replace('/')
    } catch (err: any) {
      console.error('Fingerprint login error:', err)
      if (err?.message?.includes('Invalid') || err?.message?.includes('Failed')) {
        await clearCredentials()
        setHasCreds(false)
        setError('Password changed. Please log in with your password.')
      } else {
        setError(`Fingerprint login failed: ${err?.message || 'Unknown error'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password')
      return
    }
    setError('')
    setLoading(true)
    try {
      await logIn(email, password)
      await updateSessionTimestamp()
      await refreshUser()

      const available = await isBiometricAvailable()
      const credsStored = await hasStoredCredentials()
      if (available && !credsStored) {
        setShowEnableModal(true)
      } else {
        router.replace('/')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleEnableFingerprint = async () => {
    setShowEnableModal(false)
    try {
      const result = await promptBiometricSetup()
      if (result.success) {
        await saveCredentials(email, password)
        setHasCreds(true)
        console.log('[login] Fingerprint enabled and credentials saved')
      } else {
        console.log('[login] Fingerprint setup cancelled:', result)
      }
      await refreshUser()
    } catch (err: any) {
      console.error('Enable fingerprint error:', err)
      Alert.alert('Setup Failed', `Could not enable fingerprint login: ${err?.message || 'Unknown error'}`)
    }
    router.replace('/')
  }

  const handleSkipFingerprint = () => {
    setShowEnableModal(false)
    router.replace('/')
  }

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.circle1} />
            <View style={styles.circle2} />
            <View style={styles.iconContainer}>
              <BookOpen size={48} color={colors.primary} />
            </View>
            <Text style={styles.title}>Bible Notes</Text>
            <Text style={styles.subtitle}>Your spiritual journal, always with you</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.form}>
              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Input
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                autoCapitalize="none"
                keyboardType="email-address"
                icon={<Mail size={20} color={colors.textMuted} />}
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                icon={<Lock size={20} color={colors.textMuted} />}
              />

              <Button
                title="Sign In"
                onPress={handlePasswordLogin}
                loading={loading}
                size="lg"
                style={{ marginTop: spacing.md }}
              />

              {biometricAvailable && hasCreds && (
                <>
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <TouchableOpacity
                    style={styles.fingerprintButton}
                    onPress={attemptFingerprintLogin}
                    activeOpacity={0.7}
                  >
                    <Fingerprint size={28} color={colors.primary} />
                    <Text style={styles.fingerprintText}>
                      Sign in with fingerprint
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              <Button
                title="Don't have an account? Sign Up"
                onPress={() => router.push('/signup')}
                variant="ghost"
                size="md"
                style={{ marginTop: spacing.md }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Enable Fingerprint Modal */}
      <Modal
        visible={showEnableModal}
        transparent
        animationType="fade"
        onRequestClose={handleSkipFingerprint}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.card}>
            <View style={modalStyles.iconWrapper}>
              <Fingerprint size={40} color={colors.primary} />
            </View>
            <Text style={modalStyles.title}>Enable Fingerprint Login?</Text>
            <Text style={modalStyles.message}>
              Use your fingerprint for faster access next time. Your credentials are stored securely on this device.
            </Text>
            <Button
              title="Enable"
              onPress={handleEnableFingerprint}
              size="lg"
              style={{ width: '100%', marginBottom: spacing.md }}
            />
            <Button
              title="Not Now"
              onPress={handleSkipFingerprint}
              variant="ghost"
              size="md"
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  )
}
```

- [ ] **Step 3: Update styles**

Add the divider styles to the `styles` StyleSheet, and remove the old `biometricButton` / `biometricText` styles that are no longer used:

Replace the entire `styles` StyleSheet with:

```typescript
const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.primary,
    paddingHorizontal: 0,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.xl * 2,
    position: 'relative',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width,
    backgroundColor: colors.primaryLight,
    opacity: 0.2,
    top: -width * 0.5,
    right: -width * 0.3,
  },
  circle2: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width,
    backgroundColor: colors.accent,
    opacity: 0.1,
    bottom: -width * 0.4,
    left: -width * 0.2,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  title: {
    ...typography.heading1,
    color: colors.textInverse,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  formContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl * 1.5,
    ...shadows.lg,
    flex: 1,
  },
  form: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
    backgroundColor: 'rgba(153,27,27,0.08)',
    padding: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textMuted,
    marginHorizontal: spacing.md,
  },
  fingerprintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  fingerprintText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary,
  },
})
```

Keep the `modalStyles` StyleSheet as-is.

- [ ] **Step 4: Verify TypeScript**

Run: `cd apps/mobile && npx tsc --noEmit`
Expected: No errors

---

## Task 4: Update `app/settings.tsx`

**Files:**
- Modify: `apps/mobile/app/settings.tsx`

**Goal:** Simplify toggle. Remove `biometricEnabled` flag dependency. Toggle ON prompts password → fingerprint → save. Toggle OFF clears credentials.

- [ ] **Step 1: Update imports**

Replace the imports (lines 1-18) with:

```typescript
import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Switch, Alert, Modal } from 'react-native'
import { router } from 'expo-router'
import { logIn } from '@bible-notes/pocketbase-client'
import { useAuth } from '../components/auth-provider'
import { Screen, Button, Input } from '../components/ui'
import { colors, spacing, typography, shadows, radius } from '../theme'
import {
  isBiometricAvailable,
  hasStoredCredentials,
  saveCredentials,
  clearCredentials,
  promptBiometricSetup,
  updateSessionTimestamp,
} from '../lib/biometric-auth'
import { Fingerprint, Shield, User, LogOut, Lock } from 'lucide-react-native'
```

- [ ] **Step 2: Update component state and handlers**

Replace the component body (from `export default function SettingsScreen` to just before `return`) with:

```typescript
export default function SettingsScreen() {
  const { user, logout, refreshUser, biometricAvailable, hasStoredCredentials: authHasCreds } = useAuth()
  const [loading, setLoading] = useState(false)
  const [fingerprintSwitch, setFingerprintSwitch] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    const check = async () => {
      if (biometricAvailable) {
        const creds = await hasStoredCredentials()
        setFingerprintSwitch(creds)
      } else {
        setFingerprintSwitch(false)
      }
    }
    check()
  }, [biometricAvailable, authHasCreds])

  const handleToggleFingerprint = async (value: boolean) => {
    if (value) {
      setPassword('')
      setPasswordError('')
      setShowPasswordModal(true)
    } else {
      setLoading(true)
      try {
        await clearCredentials()
        setFingerprintSwitch(false)
        await refreshUser()
        Alert.alert('Success', 'Fingerprint login has been disabled.')
      } catch (err: any) {
        console.error('Disable fingerprint error:', err)
        Alert.alert('Error', `Failed to disable fingerprint login: ${err?.message || 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleEnableFingerprint = async () => {
    if (!password.trim()) {
      setPasswordError('Password is required')
      return
    }

    setLoading(true)
    setPasswordError('')

    try {
      await logIn(user?.email || '', password)
      const result = await promptBiometricSetup()
      if (result.success) {
        await saveCredentials(user?.email || '', password)
        await updateSessionTimestamp()
        setFingerprintSwitch(true)
        await refreshUser()
        setShowPasswordModal(false)
        Alert.alert('Success', 'Fingerprint login has been enabled.')
      } else {
        console.log('[settings] Fingerprint setup cancelled:', result)
        if ('error' in result && result.error) {
          Alert.alert('Setup Failed', `Fingerprint error: ${result.error}`)
        } else {
          Alert.alert('Cancelled', 'Fingerprint setup was cancelled.')
        }
      }
    } catch (err: any) {
      console.error('Enable fingerprint error:', err)
      setPasswordError(`Invalid password. (${err?.message || 'Unknown error'})`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout()
            router.replace('/login')
          },
        },
      ]
    )
  }
```

- [ ] **Step 3: Update the fingerprint setting row in JSX**

Replace the fingerprint row (around lines 128-149) with:

```tsx
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Fingerprint size={20} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Fingerprint Login</Text>
                  <Text style={styles.settingDescription}>
                    {fingerprintSwitch
                      ? 'Enabled — Use fingerprint to login quickly'
                      : 'Disabled — Login with email and password'}
                  </Text>
                </View>
              </View>
              <Switch
                value={fingerprintSwitch}
                onValueChange={handleToggleFingerprint}
                disabled={loading || !biometricAvailable}
                trackColor={{ false: colors.borderLight, true: colors.primaryLight }}
                thumbColor={colors.surface}
              />
            </View>
```

- [ ] **Step 4: Verify TypeScript**

Run: `cd apps/mobile && npx tsc --noEmit`
Expected: No errors

---

## Task 5: Final Verification

- [ ] **Step 1: Run TypeScript on all mobile files**

Run: `cd apps/mobile && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Review diff**

Run: `git diff --stat apps/mobile/`
Expected: 4 files modified

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/lib/biometric-auth.ts apps/mobile/components/auth-provider.tsx apps/mobile/app/login.tsx apps/mobile/app/settings.tsx
git commit -m "refactor(mobile): redesign fingerprint login flow

- Simplify biometric state: credential presence IS the enabled state
- Remove separate biometric_enabled flag and session-valid UI gating
- Login screen: two distinct paths (password + fingerprint button)
- First-time login prompts to enable fingerprint after success
- Fingerprint button only shown when credentials are stored
- Invalid credentials auto-clear on auth failure
- Settings toggle manages credential presence directly
- Add comprehensive error logging throughout"
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|-----------------|------|
| First login shows enable-fingerprint modal | Task 3, Step 2 |
| "Not Now" dismisses modal, no credentials stored | Task 3, Step 2 (handleSkipFingerprint) |
| "Enable" prompts fingerprint, stores credentials | Task 3, Step 2 (handleEnableFingerprint) |
| Return visit shows "Sign in with fingerprint" button | Task 3, Step 2 (conditional rendering) |
| Fingerprint login works and redirects | Task 3, Step 2 (attemptFingerprintLogin) |
| Fingerprint cancel stays on login screen | Task 3, Step 2 |
| Invalid credentials auto-clear and show error | Task 3, Step 2 |
| Settings toggle OFF clears credentials | Task 4, Step 2 |
| Settings toggle ON with no credentials prompts password | Task 4, Step 2 |
| Logout clears credentials | Task 2, Step 1 |
| iOS Face ID permission in app.json | Already present from prior fix |

---

**Plan complete. Ready for execution.**

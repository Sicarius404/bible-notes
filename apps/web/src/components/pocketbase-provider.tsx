'use client'

import { createContext, useContext, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react'
import { getPocketBase } from '@bible-notes/pocketbase-client'
import type { AuthUser } from '@bible-notes/pocketbase-client'
import type PocketBase from 'pocketbase'
import { logIn, logOut, signUp } from '@bible-notes/pocketbase-client'

type AuthContextType = {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  signup: (email: string, password: string, name?: string) => Promise<AuthUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within PocketBaseProvider')
  return context
}

/**
 * Sync PocketBase auth store to a cookie so middleware can read it.
 * This bridges the gap between client-side localStorage auth and
 * server-side middleware that needs to verify authentication.
 */
function syncAuthToCookie(pb: PocketBase) {
  if (typeof document === 'undefined') return
  const secure = window.location.protocol === 'https:' ? 'Secure; ' : ''
  document.cookie = `pb_auth=${pb.authStore.token}; path=/; max-age=${pb.authStore.token ? 60 * 60 * 24 * 7 : 0}; ${secure}SameSite=Lax`
}

// useSyncExternalStore requires getSnapshot to return a stable reference
// when the underlying record hasn't changed, so cache the mapped user
// against the auth store record it was derived from.
let cachedRecord: Record<string, unknown> | null | undefined
let cachedUser: AuthUser | null = null

function snapshotUser(pb: PocketBase): AuthUser | null {
  const record = pb.authStore.record
  if (record === cachedRecord) return cachedUser
  cachedRecord = record
  cachedUser = record ? mapUser(record) : null
  return cachedUser
}

export function PocketBaseProvider({ children }: { children: React.ReactNode }) {
  const pb = useMemo(() => getPocketBase(), [])

  // Subscribe to the PocketBase auth store as an external store:
  // getServerSnapshot (null) is used for SSR/hydration to avoid mismatches,
  // and getSnapshot re-renders when auth state changes.
  const user = useSyncExternalStore(
    useCallback((onChange: () => void) => pb.authStore.onChange(() => onChange()), [pb]),
    () => snapshotUser(pb),
    () => null
  )

  // Sync auth state to the cookie for the middleware (external system).
  useEffect(() => {
    syncAuthToCookie(pb)
  }, [pb, user])

  const login = useCallback(async (email: string, password: string) => {
    const authUser = await logIn(email, password)
    syncAuthToCookie(getPocketBase())
    return authUser
  }, [])

  const signupFn = useCallback(async (email: string, password: string, name?: string) => {
    const authUser = await signUp(email, password, name)
    syncAuthToCookie(getPocketBase())
    return authUser
  }, [])

  const logout = useCallback(async () => {
    await logOut()
    syncAuthToCookie(getPocketBase())
  }, [])

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    signup: signupFn,
    logout,
  }), [user, login, signupFn, logout])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

function mapUser(record: Record<string, unknown>): AuthUser {
  return {
    id: record.id as string,
    email: record.email as string,
    name: record.name as string,
    avatar: record.avatar as string | undefined,
    created: record.created as string,
    updated: record.updated as string,
  }
}

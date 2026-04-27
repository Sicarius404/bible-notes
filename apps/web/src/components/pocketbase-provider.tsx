'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { getPocketBase, resetPocketBase } from '@bible-notes/pocketbase-client'
import type { AuthUser } from '@bible-notes/pocketbase-client'
import type PocketBase from 'pocketbase'
import { logIn, logOut, getCurrentUser, signUp } from '@bible-notes/pocketbase-client'

type AuthContextType = {
  user: AuthUser | null
  isLoading: boolean
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

export function PocketBaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pb = useMemo(() => getPocketBase(), [])

  useEffect(() => {
    // Check if already authenticated
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)

    // Sync auth state to cookie for middleware
    syncAuthToCookie(pb)

    // Listen for auth state changes
    const unsub = pb.authStore.onChange((_token: string, record: Record<string, unknown> | null) => {
      if (record) {
        setUser({
          id: record.id as string,
          email: record.email as string,
          name: record.name as string,
          avatar: record.avatar as string | undefined,
          created: record.created as string,
          updated: record.updated as string,
        })
      } else {
        setUser(null)
      }
      // Re-sync cookie on every auth change
      syncAuthToCookie(pb)
    })

    return () => {
      unsub()
    }
  }, [pb.authStore.token])

  const login = useCallback(async (email: string, password: string) => {
    const authUser = await logIn(email, password)
    setUser(authUser)
    syncAuthToCookie(getPocketBase())
    return authUser
  }, [])

  const signupFn = useCallback(async (email: string, password: string, name?: string) => {
    const authUser = await signUp(email, password, name)
    setUser(authUser)
    syncAuthToCookie(getPocketBase())
    return authUser
  }, [])

  const logout = useCallback(async () => {
    await logOut()
    setUser(null)
    syncAuthToCookie(getPocketBase())
  }, [])

  const contextValue = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup: signupFn,
    logout,
  }), [user, isLoading, login, signupFn, logout])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
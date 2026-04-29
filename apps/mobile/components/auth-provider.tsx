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

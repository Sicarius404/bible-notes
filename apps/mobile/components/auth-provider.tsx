import { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, isAuthenticated, logOut } from '@bible-notes/pocketbase-client'
import type { AuthUser } from '@bible-notes/pocketbase-client'

const AuthContext = createContext<{
  user: AuthUser | null
  isLoading: boolean
  logout: () => Promise<void>
}>({ user: null, isLoading: true, logout: async () => {} })

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const current = getCurrentUser()
    setUser(current)
    setIsLoading(false)
  }, [])

  const logout = async () => {
    await logOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

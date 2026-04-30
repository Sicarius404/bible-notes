import React from 'react'
import { useColorScheme } from 'react-native'

interface ProviderProps {
  children: React.ReactNode
}

export function GluestackProvider({ children }: ProviderProps) {
  return <>{children}</>
}
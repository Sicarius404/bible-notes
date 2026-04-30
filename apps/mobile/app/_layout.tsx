import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider, useAuth } from '../components/auth-provider'
import { colors } from '../theme'
import { useEffect } from 'react'

function RootLayoutNav() {
  const { user, isLoading } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = segments[0] === '(tabs)'
    const inLoginGroup = segments[0] === 'login' || segments[0] === 'signup'

    if (!user && inAuthGroup) {
      // Redirect to login if accessing protected routes while not authenticated
      router.replace('/login')
    } else if (user && inLoginGroup) {
      // Redirect to home if already authenticated and on login/signup
      router.replace('/')
    }
  }, [user, isLoading, segments])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="settings" />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutNav />
        <StatusBar style="dark" />
      </AuthProvider>
    </SafeAreaProvider>
  )
}

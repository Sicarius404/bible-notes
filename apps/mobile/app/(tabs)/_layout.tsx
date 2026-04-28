import { Tabs } from 'expo-router'
import { useAuth } from '../../components/auth-provider'
import { Button } from 'react-native'
import { router } from 'expo-router'

export default function TabLayout() {
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.replace('/login')
  }

  return (
    <Tabs screenOptions={{ headerShown: true, headerRight: () => (
      <Button title="Logout" onPress={handleLogout} />
    )}}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="bible-notes" options={{ title: 'Notes' }} />
      <Tabs.Screen name="small-groups" options={{ title: 'Groups' }} />
      <Tabs.Screen name="sermons" options={{ title: 'Sermons' }} />
      <Tabs.Screen name="reading-plans" options={{ title: 'Plans' }} />
      <Tabs.Screen name="revelations" options={{ title: 'Revelations' }} />
    </Tabs>
  )
}

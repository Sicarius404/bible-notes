import { Tabs } from 'expo-router'
import { Text } from 'react-native'

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="bible-notes" options={{ title: 'Notes' }} />
      <Tabs.Screen name="sermons" options={{ title: 'Sermons' }} />
      <Tabs.Screen name="reading-plans" options={{ title: 'Plans' }} />
      <Tabs.Screen name="revelations" options={{ title: 'Revelations' }} />
    </Tabs>
  )
}

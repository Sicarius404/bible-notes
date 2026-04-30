import { Tabs } from 'expo-router'
import { useAuth } from '../../components/auth-provider'
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Home, BookOpen, Mic, CalendarDays, Church, Settings, LogOut, Users } from 'lucide-react-native'
import { colors, typography, shadows } from '../../theme'

export default function TabLayout() {
  const { logout, user } = useAuth()
  const insets = useSafeAreaInsets()

  const handleLogout = async () => {
    await logout()
    router.replace('/login')
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { 
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerTitleStyle: { ...typography.heading3, color: colors.text, letterSpacing: -0.4 },
        headerRight: () => (
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push('/settings')} style={styles.headerBtn} activeOpacity={0.6}>
              <Settings size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.headerBtn} activeOpacity={0.6}>
              <LogOut size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ),
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          paddingTop: 10,
          paddingBottom: insets.bottom + 10,
          height: 56 + insets.bottom + 10,
          ...shadows.lg,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size || 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bible-notes"
        options={{
          title: 'Notes',
          headerTitle: 'Bible Notes',
          tabBarIcon: ({ color, size }) => <BookOpen size={size || 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sermons"
        options={{
          title: 'Sermons',
          tabBarIcon: ({ color, size }) => <Mic size={size || 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reading-plans"
        options={{
          title: 'Plans',
          headerTitle: 'Reading Plans',
          tabBarIcon: ({ color, size }) => <CalendarDays size={size || 24} color={color} />,
          href: null,
        }}
      />
      <Tabs.Screen
        name="small-groups"
        options={{
          title: 'uGroup',
          headerTitle: 'uGroup',
          tabBarIcon: ({ color, size }) => <Users size={size || 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="revelations"
        options={{
          title: 'Revelations',
          tabBarIcon: ({ color, size }) => <Church size={size || 24} color={color} />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    gap: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtn: {
    marginRight: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
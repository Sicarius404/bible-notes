import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import { listSermons } from '@bible-notes/pocketbase-client'
import type { Sermon } from '@bible-notes/shared'
import { SERVICE_TYPE_LABELS } from '@bible-notes/shared'
import { router } from 'expo-router'
import { Card, CardTitle, CardSubtitle, Screen, EmptyState } from '../../components/ui'
import { colors, spacing } from '../../theme'
import { Plus } from 'lucide-react-native'

export default function SermonsScreen() {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadSermons = async () => {
    try {
      const result = await listSermons({ page: 1, per_page: 50 })
      setSermons(result.items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadSermons() }, [])

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    )
  }

  return (
    <Screen>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/sermons/new')}
        activeOpacity={0.85}
      >
        <Plus size={24} color={colors.textInverse} />
      </TouchableOpacity>

      <FlatList
        data={sermons}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadSermons() }} tintColor={colors.primary} />
        }
        ListEmptyComponent={<EmptyState title="No sermons yet" subtitle="Tap the + button to add your first sermon note" />}
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/sermons/${item.id}`)}>
            <CardTitle>{item.title}</CardTitle>
            <CardSubtitle>{item.pastor} · {item.campus}</CardSubtitle>
            <CardSubtitle style={{ marginTop: 4 }}>
              <Text style={styles.badge}>{SERVICE_TYPE_LABELS[item.service_type]}</Text> · {item.date}
            </CardSubtitle>
          </Card>
        )}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
elevation: 6,
  },
  badge: {
    backgroundColor: colors.accent + '20',
    color: colors.accentDark,
    fontWeight: '600',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
})

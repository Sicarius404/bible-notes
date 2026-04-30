import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import { listSmallGroupNotes } from '@bible-notes/pocketbase-client'
import type { SmallGroupNote } from '@bible-notes/shared'
import { router } from 'expo-router'
import { Card, CardTitle, CardSubtitle, Screen, EmptyState } from '../../components/ui'
import { colors, spacing } from '../../theme'
import { Plus } from 'lucide-react-native'

export default function SmallGroupsScreen() {
  const [notes, setNotes] = useState<SmallGroupNote[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadNotes = async () => {
    try {
      const result = await listSmallGroupNotes({ page: 1, per_page: 50 })
      setNotes(result.items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadNotes() }, [])

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
        onPress={() => router.push('/small-groups/new')}
        activeOpacity={0.85}
      >
        <Plus size={24} color={colors.textInverse} />
      </TouchableOpacity>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadNotes() }} tintColor={colors.primary} />
        }
        ListEmptyComponent={<EmptyState title="No small group notes yet" subtitle="Tap the + button to add your first note" />}
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/small-groups/${item.id}`)}>
            <CardTitle>{item.topic}</CardTitle>
            <CardSubtitle>{item.date}</CardSubtitle>
            <CardSubtitle numberOfLines={2} style={{ marginTop: 4 }}>
              {item.content}
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
})

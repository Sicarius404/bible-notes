import { useCallback, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert, TextInput } from 'react-native'
import { listSermons, deleteSermon } from '@bible-notes/pocketbase-client'
import type { Sermon } from '@bible-notes/shared'
import { SERVICE_TYPE_LABELS } from '@bible-notes/shared'
import { useFocusEffect } from '@react-navigation/native'
import { router } from 'expo-router'
import { Card, CardTitle, CardSubtitle, Screen, EmptyState } from '../../components/ui'
import { colors, spacing } from '../../theme'
import { Plus, Trash2 } from 'lucide-react-native'

export default function SermonsScreen() {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')

  const loadSermons = async () => {
    try {
      const result = await listSermons({ page: 1, per_page: 50, search: search || undefined })
      setSermons(result.items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete Sermon', `Are you sure you want to delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSermon(id)
            loadSermons()
          } catch (err) {
            console.error(err)
          }
        },
      },
    ])
  }

  useFocusEffect(
    useCallback(() => {
      loadSermons()
    }, [])
  )

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

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search sermons..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={(text) => {
            setSearch(text)
            setTimeout(() => {
              loadSermons()
            }, 300)
          }}
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        data={sermons}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadSermons() }} tintColor={colors.primary} />
        }
        ListEmptyComponent={<EmptyState title="No sermons yet" subtitle="Tap the + button to add your first sermon note" />}
        renderItem={({ item }) => (
          <View key={item.id} style={styles.cardWrapper}>
            <Card onPress={() => router.push(`/sermons/${item.id}`)}>
              <CardTitle>{item.title}</CardTitle>
              <CardSubtitle>{item.pastor} · {item.campus}</CardSubtitle>
              <CardSubtitle style={{ marginTop: 4 }}>
                <Text style={styles.badge}>{SERVICE_TYPE_LABELS[item.service_type]}</Text> · {item.date}
              </CardSubtitle>
            </Card>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id, item.title)}
            >
              <Trash2 size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
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
  searchContainer: {
    marginBottom: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  cardWrapper: {
    marginBottom: spacing.sm,
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    padding: spacing.xs,
    zIndex: 10,
  },
})

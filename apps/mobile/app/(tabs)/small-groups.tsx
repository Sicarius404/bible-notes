import { useCallback, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert, TextInput } from 'react-native'
import { listSmallGroupNotes, deleteSmallGroupNote } from '@bible-notes/pocketbase-client'
import type { SmallGroupNote } from '@bible-notes/shared'
import { router } from 'expo-router'
import { Card, CardTitle, CardSubtitle, Screen, EmptyState } from '../../components/ui'
import { colors, spacing } from '../../theme'
import { useFocusEffect } from '@react-navigation/native'
import { Plus, Trash2 } from 'lucide-react-native'

export default function SmallGroupsScreen() {
  const [notes, setNotes] = useState<SmallGroupNote[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [search, setSearch] = useState('')

  const handleDelete = (id: string, topic: string) => {
    Alert.alert('Delete Note', `Are you sure you want to delete "${topic}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSmallGroupNote(id)
            loadNotes()
          } catch (err) {
            console.error(err)
          }
        },
      },
    ])
  }

  const loadNotes = async () => {
    try {
      const result = await listSmallGroupNotes({ page: 1, per_page: 50, search: search || undefined })
      setNotes(result.items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadNotes()
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
        onPress={() => router.push('/small-groups/new')}
        activeOpacity={0.85}
      >
        <Plus size={24} color={colors.textInverse} />
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={(text) => {
            setSearch(text)
            setTimeout(() => {
              loadNotes()
            }, 300)
          }}
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadNotes() }} tintColor={colors.primary} />
        }
        ListEmptyComponent={<EmptyState title="No small group notes yet" subtitle="Tap the + button to add your first note" />}
        renderItem={({ item }) => (
          <View key={item.id} style={styles.cardWrapper}>
            <Card onPress={() => router.push(`/small-groups/${item.id}`)}>
              <CardTitle>{item.topic}</CardTitle>
              <CardSubtitle>{item.date}</CardSubtitle>
              <CardSubtitle numberOfLines={2} style={{ marginTop: 4 }}>
                {item.content}
              </CardSubtitle>
            </Card>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id, item.topic)}
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

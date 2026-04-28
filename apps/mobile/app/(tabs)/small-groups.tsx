import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import { listSmallGroupNotes } from '@bible-notes/pocketbase-client'
import type { SmallGroupNote } from '@bible-notes/shared'
import { router } from 'expo-router'

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
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <FlatList
      data={notes}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadNotes() }} />}
      ListHeaderComponent={
        <TouchableOpacity style={styles.newButton} onPress={() => router.push('/small-groups/new')}>
          <Text style={styles.newButtonText}>+ New</Text>
        </TouchableOpacity>
      }
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/small-groups/${item.id}`)}>
          <Text style={styles.topic}>{item.topic}</Text>
          <Text style={styles.date}>{item.date}</Text>
          <Text numberOfLines={2} style={styles.preview}>{item.content}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No small group notes yet</Text>}
    />
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  newButton: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, marginBottom: 8 },
  newButtonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  card: { padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 8 },
  topic: { fontSize: 16, fontWeight: '500' },
  date: { fontSize: 12, color: '#666', marginTop: 4 },
  preview: { fontSize: 14, color: '#333', marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
})

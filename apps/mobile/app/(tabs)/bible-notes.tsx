import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import { listBibleNotes } from '@bible-notes/pocketbase-client'
import type { BibleNote } from '@bible-notes/shared'
import { router } from 'expo-router'

export default function BibleNotesScreen() {
  const [notes, setNotes] = useState<BibleNote[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadNotes = async () => {
    try {
      const result = await listBibleNotes({ page: 1, per_page: 50 })
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
        <TouchableOpacity style={styles.newButton} onPress={() => router.push('/bible-notes/new')}>
          <Text style={styles.newButtonText}>+ New</Text>
        </TouchableOpacity>
      }
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/bible-notes/${item.id}`)}>
          <Text style={styles.verse}>{item.verse_refs?.join(', ') || 'Note'}</Text>
          <Text style={styles.date}>{item.date}</Text>
          <Text numberOfLines={2} style={styles.preview}>{item.content}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No notes yet</Text>}
    />
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  newButton: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, marginBottom: 8 },
  newButtonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  card: { padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 8 },
  verse: { fontSize: 16, fontWeight: '500', color: '#2563eb' },
  date: { fontSize: 12, color: '#666', marginTop: 4 },
  preview: { fontSize: 14, color: '#333', marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
})

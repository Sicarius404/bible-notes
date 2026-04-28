import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, TextInput, Button } from 'react-native'
import { listRevelations, createRevelation } from '@bible-notes/pocketbase-client'
import type { Revelation } from '@bible-notes/shared'
import { router } from 'expo-router'

export default function RevelationsScreen() {
  const [revelations, setRevelations] = useState<Revelation[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadRevelations = async () => {
    try {
      const result = await listRevelations({ page: 1, per_page: 50 })
      setRevelations(result.items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadRevelations() }, [])

  const handleCreate = async () => {
    if (!content.trim()) return
    try {
      await createRevelation({ content: content.trim() })
      setContent('')
      loadRevelations()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Jot down a revelation..."
          value={content}
          onChangeText={setContent}
        />
        <Button title="Add" onPress={handleCreate} />
      </View>
      <FlatList
        data={revelations}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadRevelations() }} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/revelations/${item.id}`)}>
            <Text numberOfLines={3} style={styles.content}>{item.content}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No revelations yet</Text>}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  inputRow: { flexDirection: 'row', padding: 16, gap: 8, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
  card: { padding: 12, backgroundColor: '#f5f5f5', marginHorizontal: 16, marginBottom: 8, borderRadius: 8 },
  content: { fontSize: 14 },
  date: { fontSize: 12, color: '#666', marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
})

import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import { listSermons } from '@bible-notes/pocketbase-client'
import type { Sermon } from '@bible-notes/shared'
import { SERVICE_TYPE_LABELS } from '@bible-notes/shared'
import { router } from 'expo-router'

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
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <FlatList
      data={sermons}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadSermons() }} />}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/sermons/${item.id}`)}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>{item.pastor} · {item.campus} · {SERVICE_TYPE_LABELS[item.service_type]}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No sermons yet</Text>}
    />
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '500' },
  meta: { fontSize: 13, color: '#666', marginTop: 4 },
  date: { fontSize: 12, color: '#999', marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
})

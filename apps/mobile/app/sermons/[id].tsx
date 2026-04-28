import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { getSermon } from '@bible-notes/pocketbase-client'
import type { Sermon } from '@bible-notes/shared'
import { SERVICE_TYPE_LABELS } from '@bible-notes/shared'
import { useLocalSearchParams } from 'expo-router'

export default function SermonDetail() {
  const { id } = useLocalSearchParams()
  const [sermon, setSermon] = useState<Sermon | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSermon()
  }, [id])

  const loadSermon = async () => {
    try {
      const result = await getSermon(id as string)
      setSermon(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!sermon) {
    return (
      <View style={styles.center}>
        <Text>Sermon not found</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{sermon.title}</Text>
      <Text style={styles.meta}>{sermon.pastor} · {sermon.campus} · {SERVICE_TYPE_LABELS[sermon.service_type]}</Text>
      <Text style={styles.date}>{sermon.date}</Text>
      <Text style={styles.content}>{sermon.content}</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
  meta: { fontSize: 14, color: '#666', marginBottom: 4 },
  date: { fontSize: 14, color: '#999', marginBottom: 16 },
  content: { fontSize: 16, lineHeight: 24 },
})

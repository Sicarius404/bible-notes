import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { getSmallGroupNote } from '@bible-notes/pocketbase-client'
import type { SmallGroupNote } from '@bible-notes/shared'
import { useLocalSearchParams } from 'expo-router'

export default function SmallGroupDetail() {
  const { id } = useLocalSearchParams()
  const [note, setNote] = useState<SmallGroupNote | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNote()
  }, [id])

  const loadNote = async () => {
    try {
      const result = await getSmallGroupNote(id as string)
      setNote(result)
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

  if (!note) {
    return (
      <View style={styles.center}>
        <Text>Note not found</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.topic}>{note.topic}</Text>
      <Text style={styles.date}>{note.date}</Text>
      <Text style={styles.label}>Attendees</Text>
      <Text style={styles.content}>{note.attendees}</Text>
      <Text style={styles.label}>Content</Text>
      <Text style={styles.content}>{note.content}</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topic: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
  date: { fontSize: 14, color: '#666', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginTop: 16, marginBottom: 4 },
  content: { fontSize: 16, lineHeight: 24 },
})

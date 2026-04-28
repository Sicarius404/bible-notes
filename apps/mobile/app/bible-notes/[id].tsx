import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { getBibleNote } from '@bible-notes/pocketbase-client'
import type { BibleNote } from '@bible-notes/shared'
import { useLocalSearchParams } from 'expo-router'

export default function BibleNoteDetail() {
  const { id } = useLocalSearchParams()
  const [note, setNote] = useState<BibleNote | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNote()
  }, [id])

  const loadNote = async () => {
    try {
      const result = await getBibleNote(id as string)
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
      <Text style={styles.verses}>{note.verse_refs?.join(', ') || 'Bible Note'}</Text>
      <Text style={styles.date}>{note.date}</Text>
      <Text style={styles.content}>{note.content}</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  verses: { fontSize: 20, fontWeight: '600', color: '#2563eb', marginBottom: 8 },
  date: { fontSize: 14, color: '#666', marginBottom: 16 },
  content: { fontSize: 16, lineHeight: 24 },
})

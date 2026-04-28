import { useState } from 'react'
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { createBibleNote } from '@bible-notes/pocketbase-client'

export default function NewBibleNoteScreen() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [verseRefs, setVerseRefs] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('Content is required')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const refsArray = verseRefs
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean)
      await createBibleNote({ date, verse_refs: refsArray, content: content.trim() })
      router.back()
    } catch (err) {
      setError('Failed to create')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>New Bible Note</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.label}>Date</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Verse References (comma-separated)</Text>
      <TextInput
        style={styles.input}
        value={verseRefs}
        onChangeText={setVerseRefs}
        placeholder="e.g. John 3:16, Romans 8:28"
      />

      <Text style={styles.label}>Content</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={content}
        onChangeText={setContent}
        placeholder="Write your notes..."
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />

      <Button title={submitting ? 'Creating...' : 'Create'} onPress={handleSubmit} disabled={submitting} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  textarea: { minHeight: 140 },
  error: { color: '#dc2626', marginBottom: 12 },
})

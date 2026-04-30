import { useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { createBibleNote } from '@bible-notes/pocketbase-client'
import { Input, Button, Screen } from '../../components/ui'
import { RichTextInput } from '../../components/ui/RichTextInput'
import { colors, spacing, typography } from '../../theme'

export default function NewBibleNoteScreen() {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [verseRefs, setVerseRefs] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required')
      return
    }
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
      await createBibleNote({ title: title.trim(), date, verse_refs: refsArray, content: content.trim() })
      router.back()
    } catch (err) {
      setError('Failed to create note')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Text style={styles.title}>New Bible Note</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Input
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="Note title"
          />

          <Input
            label="Date"
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
          />

          <Input
            label="Verse References"
            value={verseRefs}
            onChangeText={setVerseRefs}
            placeholder="e.g. John 3:16, Romans 8:28"
          />

          <RichTextInput
            label="Content"
            value={content}
            onChangeText={setContent}
            placeholder="Write your notes..."
          />

          <View style={styles.buttonRow}>
            <Button title={submitting ? 'Creating...' : 'Create Note'} onPress={handleSubmit} loading={submitting} style={{ flex: 1 }} />
            <Button title="Cancel" onPress={() => router.back()} variant="outline" style={{ flex: 1 }} />
          </View>
        </View>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  form: {
    paddingTop: spacing.lg,
  },
  title: {
    ...typography.heading2,
    marginBottom: spacing.lg,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    marginBottom: spacing.md,
    backgroundColor: 'rgba(192,57,43,0.08)',
    padding: spacing.md,
    borderRadius: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
})

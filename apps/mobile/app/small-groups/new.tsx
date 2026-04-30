import { useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { createSmallGroupNote } from '@bible-notes/pocketbase-client'
import { Input, Button, Screen } from '../../components/ui'
import { RichTextInput } from '../../components/ui/RichTextInput'
import { colors, spacing, typography } from '../../theme'

export default function NewSmallGroupNoteScreen() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [topic, setTopic] = useState('')
  const [attendees, setAttendees] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!topic.trim()) {
      setError('Topic is required')
      return
    }
    if (!content.trim()) {
      setError('Content is required')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await createSmallGroupNote({
        date,
        topic: topic.trim(),
        attendees: attendees.trim(),
        content: content.trim(),
      })
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
          <Text style={styles.title}>New Small Group Note</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Input label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
          <Input label="Topic" value={topic} onChangeText={setTopic} placeholder="Topic of discussion" />
          <Input label="Attendees" value={attendees} onChangeText={setAttendees} placeholder="Names of attendees" />
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

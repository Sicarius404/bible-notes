import { useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { createRevelation } from '@bible-notes/pocketbase-client'
import { Input, Button, Screen } from '../../components/ui'
import { RichTextInput } from '../../components/ui/RichTextInput'
import { colors, spacing, typography } from '../../theme'

export default function NewRevelationScreen() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
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
      await createRevelation({ date, content: content.trim() })
      router.back()
    } catch (err) {
      setError('Failed to create revelation')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Text style={styles.title}>New Revelation</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Input label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
          <RichTextInput
            label="Content"
            value={content}
            onChangeText={setContent}
            placeholder="Write your revelation..."
          />

          <View style={styles.buttonRow}>
            <Button title={submitting ? 'Creating...' : 'Create Revelation'} onPress={handleSubmit} loading={submitting} style={{ flex: 1 }} />
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

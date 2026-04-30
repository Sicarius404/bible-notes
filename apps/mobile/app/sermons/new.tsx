import { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { createSermon } from '@bible-notes/pocketbase-client'
import { SERVICE_TYPE_LABELS } from '@bible-notes/shared'
import type { ServiceType } from '@bible-notes/shared'
import { Input, Button, Screen } from '../../components/ui'
import { RichTextInput } from '../../components/ui/RichTextInput'
import { colors, spacing, typography } from '../../theme'

const SERVICE_TYPES: ServiceType[] = ['morning', 'evening', 'special']

export default function NewSermonScreen() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [title, setTitle] = useState('')
  const [pastor, setPastor] = useState('')
  const [campus, setCampus] = useState('')
  const [serviceType, setServiceType] = useState<ServiceType>('morning')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (!pastor.trim()) {
      setError('Pastor is required')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await createSermon({
        date,
        title: title.trim(),
        pastor: pastor.trim(),
        campus: campus.trim(),
        service_type: serviceType,
        content: content.trim(),
      })
      router.back()
    } catch (err) {
      setError('Failed to create sermon')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Text style={styles.title}>New Sermon</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Input label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
          <Input label="Title" value={title} onChangeText={setTitle} placeholder="Sermon title" />
          <Input label="Pastor" value={pastor} onChangeText={setPastor} placeholder="Pastor's name" />
          <Input label="Campus" value={campus} onChangeText={setCampus} placeholder="Campus name" />

          <Text style={styles.label}>Service Type</Text>
          <View style={styles.serviceTypeRow}>
            {SERVICE_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.serviceTypeButton,
                  serviceType === type && styles.serviceTypeButtonActive,
                ]}
                onPress={() => setServiceType(type)}
              >
                <Text
                  style={[
                    styles.serviceTypeText,
                    serviceType === type && styles.serviceTypeTextActive,
                  ]}
                >
                  {SERVICE_TYPE_LABELS[type]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <RichTextInput
            label="Content"
            value={content}
            onChangeText={setContent}
            placeholder="Write your sermon notes..."
          />

          <View style={styles.buttonRow}>
            <Button title={submitting ? 'Creating...' : 'Create Sermon'} onPress={handleSubmit} loading={submitting} style={{ flex: 1 }} />
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
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  serviceTypeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  serviceTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  serviceTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  serviceTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  serviceTypeTextActive: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
})

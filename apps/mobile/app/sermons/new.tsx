import { useState } from 'react'
import { View, Text, TextInput, Button, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { createSermon } from '@bible-notes/pocketbase-client'
import { SERVICE_TYPE_LABELS } from '@bible-notes/shared'
import type { ServiceType } from '@bible-notes/shared'

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
      setError('Failed to create')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>New Sermon</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.label}>Date</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Sermon title"
      />

      <Text style={styles.label}>Pastor</Text>
      <TextInput
        style={styles.input}
        value={pastor}
        onChangeText={setPastor}
        placeholder="Pastor's name"
      />

      <Text style={styles.label}>Campus</Text>
      <TextInput
        style={styles.input}
        value={campus}
        onChangeText={setCampus}
        placeholder="Campus name"
      />

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

      <Text style={styles.label}>Content</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={content}
        onChangeText={setContent}
        placeholder="Write your sermon notes..."
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
  serviceTypeRow: { flexDirection: 'row', gap: 8 },
  serviceTypeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  serviceTypeButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  serviceTypeText: { fontSize: 14, color: '#333' },
  serviceTypeTextActive: { color: '#fff', fontWeight: '600' },
})

import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TextInput, Button, Alert } from 'react-native'
import { getSermon, updateSermon, deleteSermon } from '@bible-notes/pocketbase-client'
import type { Sermon, ServiceType } from '@bible-notes/shared'
import { SERVICE_TYPE_LABELS, SERVICE_TYPES } from '@bible-notes/shared'
import { useLocalSearchParams, router } from 'expo-router'

export default function SermonDetail() {
  const { id } = useLocalSearchParams()
  const [sermon, setSermon] = useState<Sermon | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    date: '',
    title: '',
    pastor: '',
    campus: '',
    service_type: 'morning' as ServiceType,
    content: '',
  })

  useEffect(() => {
    loadSermon()
  }, [id])

  const loadSermon = async () => {
    try {
      const result = await getSermon(id as string)
      setSermon(result)
      setEditForm({
        date: result.date,
        title: result.title,
        pastor: result.pastor,
        campus: result.campus,
        service_type: result.service_type,
        content: result.content,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      await updateSermon(id as string, editForm)
      setIsEditing(false)
      setLoading(true)
      await loadSermon()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = () => {
    Alert.alert('Delete Sermon', 'Are you sure you want to delete this sermon?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSermon(id as string)
            router.back()
          } catch (err) {
            console.error(err)
          }
        },
      },
    ])
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
      {isEditing ? (
        <View>
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={editForm.date}
            onChangeText={(v) => setEditForm({ ...editForm, date: v })}
            placeholder="YYYY-MM-DD"
          />
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={editForm.title}
            onChangeText={(v) => setEditForm({ ...editForm, title: v })}
            placeholder="Sermon title"
          />
          <Text style={styles.label}>Pastor</Text>
          <TextInput
            style={styles.input}
            value={editForm.pastor}
            onChangeText={(v) => setEditForm({ ...editForm, pastor: v })}
            placeholder="Pastor name"
          />
          <Text style={styles.label}>Campus</Text>
          <TextInput
            style={styles.input}
            value={editForm.campus}
            onChangeText={(v) => setEditForm({ ...editForm, campus: v })}
            placeholder="Campus name"
          />
          <Text style={styles.label}>Service Type</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            {SERVICE_TYPES.map((type) => (
              <Button
                key={type}
                title={SERVICE_TYPE_LABELS[type]}
                onPress={() => setEditForm({ ...editForm, service_type: type })}
                color={editForm.service_type === type ? '#2563eb' : '#999'}
              />
            ))}
          </View>
          <Text style={styles.label}>Content</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={editForm.content}
            onChangeText={(v) => setEditForm({ ...editForm, content: v })}
            placeholder="Sermon content"
            multiline
          />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            <Button title="Save" onPress={handleUpdate} />
            <Button title="Cancel" onPress={() => setIsEditing(false)} />
          </View>
        </View>
      ) : (
        <View>
          <Text style={styles.title}>{sermon.title}</Text>
          <Text style={styles.meta}>{sermon.pastor} · {sermon.campus} · {SERVICE_TYPE_LABELS[sermon.service_type]}</Text>
          <Text style={styles.date}>{sermon.date}</Text>
          <Text style={styles.content}>{sermon.content}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            <Button title="Edit" onPress={() => setIsEditing(true)} />
            <Button title="Delete" color="red" onPress={handleDelete} />
          </View>
        </View>
      )}
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
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 8 },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
})

import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TextInput, Button, Alert } from 'react-native'
import { getSmallGroupNote, updateSmallGroupNote, deleteSmallGroupNote } from '@bible-notes/pocketbase-client'
import type { SmallGroupNote } from '@bible-notes/shared'
import { useLocalSearchParams, router } from 'expo-router'

export default function SmallGroupDetail() {
  const { id } = useLocalSearchParams()
  const [note, setNote] = useState<SmallGroupNote | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ date: '', topic: '', attendees: '', content: '' })

  useEffect(() => {
    loadNote()
  }, [id])

  const loadNote = async () => {
    try {
      const result = await getSmallGroupNote(id as string)
      setNote(result)
      setEditForm({
        date: result.date,
        topic: result.topic,
        attendees: result.attendees,
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
      await updateSmallGroupNote(id as string, editForm)
      setIsEditing(false)
      setLoading(true)
      await loadNote()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = () => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this small group note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSmallGroupNote(id as string)
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

  if (!note) {
    return (
      <View style={styles.center}>
        <Text>Note not found</Text>
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
          <Text style={styles.label}>Topic</Text>
          <TextInput
            style={styles.input}
            value={editForm.topic}
            onChangeText={(v) => setEditForm({ ...editForm, topic: v })}
            placeholder="Topic"
          />
          <Text style={styles.label}>Attendees</Text>
          <TextInput
            style={styles.input}
            value={editForm.attendees}
            onChangeText={(v) => setEditForm({ ...editForm, attendees: v })}
            placeholder="Attendees"
          />
          <Text style={styles.label}>Content</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={editForm.content}
            onChangeText={(v) => setEditForm({ ...editForm, content: v })}
            placeholder="Note content"
            multiline
          />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            <Button title="Save" onPress={handleUpdate} />
            <Button title="Cancel" onPress={() => setIsEditing(false)} />
          </View>
        </View>
      ) : (
        <View>
          <Text style={styles.topic}>{note.topic}</Text>
          <Text style={styles.date}>{note.date}</Text>
          <Text style={styles.label}>Attendees</Text>
          <Text style={styles.content}>{note.attendees}</Text>
          <Text style={styles.label}>Content</Text>
          <Text style={styles.content}>{note.content}</Text>
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
  topic: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
  date: { fontSize: 14, color: '#666', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginTop: 16, marginBottom: 4 },
  content: { fontSize: 16, lineHeight: 24 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 8 },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
})

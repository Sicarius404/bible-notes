import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TextInput, Button, Alert } from 'react-native'
import { getBibleNote, updateBibleNote, deleteBibleNote } from '@bible-notes/pocketbase-client'
import type { BibleNote } from '@bible-notes/shared'
import { useLocalSearchParams, router } from 'expo-router'

export default function BibleNoteDetail() {
  const { id } = useLocalSearchParams()
  const [note, setNote] = useState<BibleNote | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ date: '', verse_refs: '', content: '' })

  useEffect(() => {
    loadNote()
  }, [id])

  const loadNote = async () => {
    try {
      const result = await getBibleNote(id as string)
      setNote(result)
      setEditForm({
        date: result.date,
        verse_refs: result.verse_refs.join(', '),
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
      await updateBibleNote(id as string, {
        date: editForm.date,
        verse_refs: editForm.verse_refs.split(',').map((r) => r.trim()).filter(Boolean),
        content: editForm.content,
      })
      setIsEditing(false)
      setLoading(true)
      await loadNote()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = () => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBibleNote(id as string)
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
          <Text style={styles.label}>Verse References (comma-separated)</Text>
          <TextInput
            style={styles.input}
            value={editForm.verse_refs}
            onChangeText={(v) => setEditForm({ ...editForm, verse_refs: v })}
            placeholder="John 3:16, Romans 8:28"
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
          <Text style={styles.verses}>{note.verse_refs?.join(', ') || 'Bible Note'}</Text>
          <Text style={styles.date}>{note.date}</Text>
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
  verses: { fontSize: 20, fontWeight: '600', color: '#2563eb', marginBottom: 8 },
  date: { fontSize: 14, color: '#666', marginBottom: 16 },
  content: { fontSize: 16, lineHeight: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 8 },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
})

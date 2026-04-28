import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TextInput, Button, Alert } from 'react-native'
import { getRevelation, updateRevelation, deleteRevelation } from '@bible-notes/pocketbase-client'
import type { Revelation } from '@bible-notes/shared'
import { useLocalSearchParams, router } from 'expo-router'

export default function RevelationDetail() {
  const { id } = useLocalSearchParams()
  const [revelation, setRevelation] = useState<Revelation | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ date: '', content: '' })

  useEffect(() => {
    loadRevelation()
  }, [id])

  const loadRevelation = async () => {
    try {
      const result = await getRevelation(id as string)
      setRevelation(result)
      setEditForm({
        date: result.date,
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
      await updateRevelation(id as string, editForm)
      setIsEditing(false)
      setLoading(true)
      await loadRevelation()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = () => {
    Alert.alert('Delete Revelation', 'Are you sure you want to delete this revelation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRevelation(id as string)
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

  if (!revelation) {
    return (
      <View style={styles.center}>
        <Text>Revelation not found</Text>
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
          <Text style={styles.label}>Content</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={editForm.content}
            onChangeText={(v) => setEditForm({ ...editForm, content: v })}
            placeholder="Revelation content"
            multiline
          />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            <Button title="Save" onPress={handleUpdate} />
            <Button title="Cancel" onPress={() => setIsEditing(false)} />
          </View>
        </View>
      ) : (
        <View>
          <Text style={styles.date}>{revelation.date}</Text>
          <Text style={styles.content}>{revelation.content}</Text>
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
  date: { fontSize: 14, color: '#666', marginBottom: 16 },
  content: { fontSize: 16, lineHeight: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 8 },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
})

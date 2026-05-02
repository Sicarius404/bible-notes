import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { getSmallGroupNote, updateSmallGroupNote, deleteSmallGroupNote } from '@bible-notes/pocketbase-client'
import type { SmallGroupNote } from '@bible-notes/shared'
import { useLocalSearchParams, router } from 'expo-router'
import { Input, Button, Screen } from '../../components/ui'
import { RichTextInput } from '../../components/ui/RichTextInput'
import { MarkdownContent } from '../../components/ui/MarkdownContent'
import { colors, spacing, typography } from '../../theme'

export default function SmallGroupDetail() {
  const { id } = useLocalSearchParams()
  const [note, setNote] = useState<SmallGroupNote | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
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
    setSaving(true)
    try {
      await updateSmallGroupNote(id as string, editForm)
      setIsEditing(false)
      setLoading(true)
      await loadNote()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
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
            router.replace('/small-groups')
          } catch (err) {
            console.error(err)
          }
        },
      },
    ])
  }

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    )
  }

  if (!note) {
    return (
      <Screen style={styles.center}>
        <Text style={styles.notFound}>Note not found</Text>
      </Screen>
    )
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {isEditing ? (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Edit Small Group Note</Text>
            <Input label="Date" value={editForm.date} onChangeText={(v) => setEditForm({ ...editForm, date: v })} placeholder="YYYY-MM-DD" />
            <Input label="Topic" value={editForm.topic} onChangeText={(v) => setEditForm({ ...editForm, topic: v })} placeholder="Topic" />
            <Input label="Attendees" value={editForm.attendees} onChangeText={(v) => setEditForm({ ...editForm, attendees: v })} placeholder="Attendees" />
            <RichTextInput
              label="Content"
              value={editForm.content}
              onChangeText={(v) => setEditForm({ ...editForm, content: v })}
              placeholder="Note content"
            />
            <View style={styles.buttonRow}>
              <Button title="Save Changes" onPress={handleUpdate} loading={saving} style={{ flex: 1 }} />
              <Button title="Cancel" onPress={() => setIsEditing(false)} variant="outline" style={{ flex: 1 }} />
            </View>
          </View>
        ) : (
          <View style={styles.view}>
            <Text style={styles.topic}>{note.topic}</Text>
            <Text style={styles.date}>{note.date}</Text>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>Attendees</Text>
            <Text style={styles.content}>{note.attendees}</Text>
            <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>Content</Text>
            <MarkdownContent content={note.content} />
            <View style={styles.buttonRow}>
              <Button title="Edit" onPress={() => setIsEditing(true)} variant="outline" style={{ flex: 1 }} />
              <Button title="Delete" onPress={handleDelete} variant="ghost" style={{ flex: 1 }} />
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
  notFound: { ...typography.body, color: colors.textMuted },
  form: { paddingTop: spacing.lg },
  formTitle: { ...typography.heading2, marginBottom: spacing.lg },
  view: { paddingTop: spacing.lg },
  topic: { ...typography.heading2, marginBottom: spacing.sm },
  date: { ...typography.bodySmall, color: colors.textMuted, marginBottom: spacing.md },
  divider: { height: 1, backgroundColor: colors.borderLight, marginBottom: spacing.md },
  sectionLabel: { ...typography.heading4, color: colors.textSecondary, marginBottom: spacing.sm },
  content: { ...typography.body, lineHeight: 26, color: colors.text },
  buttonRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl, marginBottom: spacing.xxl },
})

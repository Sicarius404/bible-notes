import { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { getBibleNote, updateBibleNote, deleteBibleNote } from '@bible-notes/pocketbase-client'
import type { BibleNote } from '@bible-notes/shared'
import { useLocalSearchParams, router } from 'expo-router'
import { Input, Button, Screen } from '../../components/ui'
import { RichTextInput } from '../../components/ui/RichTextInput'
import { MarkdownContent } from '../../components/ui/MarkdownContent'
import { colors, spacing, typography } from '../../theme'

export default function BibleNoteDetail() {
  const { id } = useLocalSearchParams()
  const [note, setNote] = useState<BibleNote | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
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
    setSaving(true)
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
    } finally {
      setSaving(false)
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
            <Text style={styles.formTitle}>Edit Note</Text>
            <Input
              label="Date"
              value={editForm.date}
              onChangeText={(v) => setEditForm({ ...editForm, date: v })}
              placeholder="YYYY-MM-DD"
            />
            <Input
              label="Verse References (comma-separated)"
              value={editForm.verse_refs}
              onChangeText={(v) => setEditForm({ ...editForm, verse_refs: v })}
              placeholder="John 3:16, Romans 8:28"
            />
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
            <Text style={styles.verses}>{note.verse_refs?.join(', ') || 'Bible Note'}</Text>
            <Text style={styles.date}>{note.date}</Text>
            <View style={styles.divider} />
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    ...typography.body,
    color: colors.textMuted,
  },
  form: {
    paddingTop: spacing.lg,
  },
  formTitle: {
    ...typography.heading2,
    marginBottom: spacing.lg,
  },
  view: {
    paddingTop: spacing.lg,
  },
  verses: {
    ...typography.heading2,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  date: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
})

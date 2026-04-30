import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { getRevelation, updateRevelation, deleteRevelation } from '@bible-notes/pocketbase-client'
import type { Revelation } from '@bible-notes/shared'
import { useLocalSearchParams, router } from 'expo-router'
import { Input, Button, Screen } from '../../components/ui'
import { RichTextInput } from '../../components/ui/RichTextInput'
import { MarkdownContent } from '../../components/ui/MarkdownContent'
import { colors, spacing, typography } from '../../theme'

export default function RevelationDetail() {
  const { id } = useLocalSearchParams()
  const [revelation, setRevelation] = useState<Revelation | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
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
    setSaving(true)
    try {
      await updateRevelation(id as string, editForm)
      setIsEditing(false)
      setLoading(true)
      await loadRevelation()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
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
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    )
  }

  if (!revelation) {
    return (
      <Screen style={styles.center}>
        <Text style={styles.notFound}>Revelation not found</Text>
      </Screen>
    )
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {isEditing ? (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Edit Revelation</Text>
            <Input label="Date" value={editForm.date} onChangeText={(v) => setEditForm({ ...editForm, date: v })} placeholder="YYYY-MM-DD" />
            <RichTextInput
              label="Content"
              value={editForm.content}
              onChangeText={(v) => setEditForm({ ...editForm, content: v })}
              placeholder="Revelation content"
            />
            <View style={styles.buttonRow}>
              <Button title="Save Changes" onPress={handleUpdate} loading={saving} style={{ flex: 1 }} />
              <Button title="Cancel" onPress={() => setIsEditing(false)} variant="outline" style={{ flex: 1 }} />
            </View>
          </View>
        ) : (
          <View style={styles.view}>
            <Text style={styles.date}>{revelation.date}</Text>
            <View style={styles.divider} />
            <MarkdownContent content={revelation.content} />
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
  date: { ...typography.bodySmall, color: colors.textMuted, marginBottom: spacing.md },
  divider: { height: 1, backgroundColor: colors.borderLight, marginBottom: spacing.md },
  buttonRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl, marginBottom: spacing.xxl },
})

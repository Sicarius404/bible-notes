import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native'
import { getSermon, updateSermon, deleteSermon } from '@bible-notes/pocketbase-client'
import type { Sermon, ServiceType } from '@bible-notes/shared'
import { SERVICE_TYPE_LABELS, SERVICE_TYPES } from '@bible-notes/shared'
import { useLocalSearchParams, router } from 'expo-router'
import { Input, Button, Screen } from '../../components/ui'
import { RichTextInput } from '../../components/ui/RichTextInput'
import { MarkdownContent } from '../../components/ui/MarkdownContent'
import { colors, spacing, typography } from '../../theme'

export default function SermonDetail() {
  const { id } = useLocalSearchParams()
  const [sermon, setSermon] = useState<Sermon | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
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
    setSaving(true)
    try {
      await updateSermon(id as string, editForm)
      setIsEditing(false)
      setLoading(true)
      await loadSermon()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
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
            router.replace('/sermons')
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

  if (!sermon) {
    return (
      <Screen style={styles.center}>
        <Text style={styles.notFound}>Sermon not found</Text>
      </Screen>
    )
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {isEditing ? (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Edit Sermon</Text>
            <Input label="Date" value={editForm.date} onChangeText={(v) => setEditForm({ ...editForm, date: v })} placeholder="YYYY-MM-DD" />
            <Input label="Title" value={editForm.title} onChangeText={(v) => setEditForm({ ...editForm, title: v })} placeholder="Sermon title" />
            <Input label="Pastor" value={editForm.pastor} onChangeText={(v) => setEditForm({ ...editForm, pastor: v })} placeholder="Pastor name" />
            <Input label="Campus" value={editForm.campus} onChangeText={(v) => setEditForm({ ...editForm, campus: v })} placeholder="Campus name" />

            <Text style={styles.label}>Service Type</Text>
            <View style={styles.serviceTypeRow}>
              {SERVICE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.serviceTypeButton,
                    editForm.service_type === type && styles.serviceTypeButtonActive,
                  ]}
                  onPress={() => setEditForm({ ...editForm, service_type: type })}
                >
                  <Text style={[styles.serviceTypeText, editForm.service_type === type && styles.serviceTypeTextActive]}>
                    {SERVICE_TYPE_LABELS[type]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <RichTextInput
              label="Content"
              value={editForm.content}
              onChangeText={(v) => setEditForm({ ...editForm, content: v })}
              placeholder="Sermon content"
            />

            <View style={styles.buttonRow}>
              <Button title="Save Changes" onPress={handleUpdate} loading={saving} style={{ flex: 1 }} />
              <Button title="Cancel" onPress={() => setIsEditing(false)} variant="outline" style={{ flex: 1 }} />
            </View>
          </View>
        ) : (
          <View style={styles.view}>
            <Text style={styles.badge}>{SERVICE_TYPE_LABELS[sermon.service_type]}</Text>
            <Text style={styles.title}>{sermon.title}</Text>
            <Text style={styles.meta}>{sermon.pastor} · {sermon.campus}</Text>
            <Text style={styles.date}>{sermon.date}</Text>
            <View style={styles.divider} />
            <MarkdownContent content={sermon.content} />
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
  label: { ...typography.bodySmall, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs },
  serviceTypeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  serviceTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  serviceTypeButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  serviceTypeText: { fontSize: 14, fontWeight: '500', color: colors.textSecondary },
  serviceTypeTextActive: { color: colors.textInverse, fontWeight: '600' },
  view: { paddingTop: spacing.lg },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent + '20',
    color: colors.accentDark,
    fontWeight: '600',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  title: { ...typography.heading2, marginBottom: spacing.sm },
  meta: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xs },
  date: { ...typography.bodySmall, color: colors.textMuted, marginBottom: spacing.md },
  divider: { height: 1, backgroundColor: colors.borderLight, marginBottom: spacing.md },
  buttonRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl, marginBottom: spacing.xxl },
})

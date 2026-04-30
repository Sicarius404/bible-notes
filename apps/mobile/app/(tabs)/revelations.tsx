import { useEffect, useState } from 'react'
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Text } from 'react-native'
import { listRevelations, createRevelation } from '@bible-notes/pocketbase-client'
import type { Revelation } from '@bible-notes/shared'
import { router } from 'expo-router'
import { Card, CardSubtitle, Screen, EmptyState, Input, Button } from '../../components/ui'
import { colors, spacing } from '../../theme'

export default function RevelationsScreen() {
  const [revelations, setRevelations] = useState<Revelation[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loadRevelations = async () => {
    try {
      const result = await listRevelations({ page: 1, per_page: 50 })
      setRevelations(result.items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadRevelations() }, [])

  const handleCreate = async () => {
    if (!content.trim()) return
    setSubmitting(true)
    try {
      await createRevelation({ content: content.trim() })
      setContent('')
      loadRevelations()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    )
  }

  return (
    <Screen>
      <View style={styles.inputArea}>
        <Input
          value={content}
          onChangeText={setContent}
          placeholder="Jot down a revelation..."
          multiline
          numberOfLines={3}
          style={{ marginBottom: spacing.sm }}
        />
        <View style={styles.inputActions}>
          <Button
            title="Add"
            onPress={handleCreate}
            loading={submitting}
            size="sm"
            disabled={!content.trim()}
          />
          <Button
            title="Full Form"
            onPress={() => router.push('/revelations/new')}
            variant="outline"
            size="sm"
          />
        </View>
      </View>

      <FlatList
        data={revelations}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadRevelations() }} tintColor={colors.primary} />
        }
        ListEmptyComponent={<EmptyState title="No revelations yet" subtitle="Write down what God reveals to you" />}
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/revelations/${item.id}`)}>
            <CardSubtitle numberOfLines={3}>{item.content}</CardSubtitle>
            <CardSubtitle style={{ marginTop: 8 }}>{item.date}</CardSubtitle>
          </Card>
        )}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputArea: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  inputActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
})

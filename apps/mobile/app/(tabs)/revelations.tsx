import { useCallback, useState } from 'react'
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Text, Alert, TextInput } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { listRevelations, createRevelation, deleteRevelation } from '@bible-notes/pocketbase-client'
import type { Revelation } from '@bible-notes/shared'
import { router } from 'expo-router'
import { Trash2 } from 'lucide-react-native'
import { Card, CardSubtitle, Screen, EmptyState, Input, Button } from '../../components/ui'
import { colors, spacing } from '../../theme'

export default function RevelationsScreen() {
  const [revelations, setRevelations] = useState<Revelation[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')

  const handleDelete = (id: string) => {
    Alert.alert('Delete Revelation', 'Are you sure you want to delete this revelation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRevelation(id)
            loadRevelations()
          } catch (err) {
            console.error(err)
          }
        },
      },
    ])
  }

  const loadRevelations = async () => {
    try {
      const result = await listRevelations({ page: 1, per_page: 50, search: search || undefined })
      setRevelations(result.items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadRevelations()
    }, [])
  )

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

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search revelations..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={(text) => {
            setSearch(text)
            setTimeout(() => {
              loadRevelations()
            }, 300)
          }}
          clearButtonMode="while-editing"
        />
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
          <View key={item.id} style={styles.cardWrapper}>
            <Card onPress={() => router.push(`/revelations/${item.id}`)}>
              <CardSubtitle numberOfLines={3}>{item.content}</CardSubtitle>
              <CardSubtitle style={{ marginTop: 8 }}>{item.date}</CardSubtitle>
            </Card>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Trash2 size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
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
  searchContainer: {
    marginBottom: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  cardWrapper: {
    marginBottom: spacing.sm,
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    padding: spacing.xs,
    zIndex: 10,
  },
})

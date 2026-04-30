import { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native'
import { listBibleNotes } from '@bible-notes/pocketbase-client'
import type { BibleNote } from '@bible-notes/shared'
import { router } from 'expo-router'
import { Card, CardTitle, CardSubtitle, Screen, EmptyState } from '../../components/ui'
import { colors, spacing, typography } from '../../theme'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react-native'

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

const PAGE_SIZE = 10

export default function BibleNotesScreen() {
  const [notes, setNotes] = useState<BibleNote[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const loadNotes = async (nextPage = 1, append = false) => {
    try {
      const result = await listBibleNotes({ page: nextPage, per_page: PAGE_SIZE })
      if (append) {
        setNotes((prev) => [...prev, ...result.items])
      } else {
        setNotes(result.items)
      }
      setHasMore(result.items.length === PAGE_SIZE)
      setPage(nextPage)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => { loadNotes() }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    setExpandedId(null)
    loadNotes(1)
  }

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    loadNotes(page + 1, true)
  }

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const renderItem = ({ item }: { item: BibleNote }) => {
    const isExpanded = expandedId === item.id

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => toggleExpand(item.id)}
        style={styles.cardWrapper}
      >
        <Card variant={isExpanded ? 'highlight' : 'default'}>
          <CardTitle style={styles.cardTitle}>{item.title}</CardTitle>
          <CardSubtitle>{item.verse_refs?.join(', ') || 'No references'}</CardSubtitle>
          <CardSubtitle style={styles.cardDate}>{item.date}</CardSubtitle>

          {isExpanded && (
            <View style={styles.expandedContent}>
              <Text style={styles.contentText} numberOfLines={8}>
                {item.content}
              </Text>
              <TouchableOpacity
                onPress={() => router.push(`/bible-notes/${item.id}`)}
                activeOpacity={0.7}
              >
                <Text style={styles.viewFullLink}>View Full Note</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.expandIcon}>
            {isExpanded ? (
              <ChevronUp size={20} color={colors.textMuted} />
            ) : (
              <ChevronDown size={20} color={colors.textMuted} />
            )}
          </View>
        </Card>
      </TouchableOpacity>
    )
  }

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )
    }
    if (hasMore) {
      return (
        <TouchableOpacity
          style={styles.loadMoreButton}
          onPress={handleLoadMore}
          activeOpacity={0.8}
        >
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>
      )
    }
    if (notes.length > 0) {
      return <Text style={styles.endText}>All notes loaded</Text>
    }
    return null
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
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/bible-notes/new')}
        activeOpacity={0.85}
      >
        <Plus size={24} color={colors.textInverse} />
      </TouchableOpacity>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No notes yet"
            subtitle="Tap the + button to add your first Bible note"
          />
        }
        renderItem={renderItem}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardWrapper: {
    marginBottom: spacing.sm,
  },
  cardTitle: {
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  cardDate: {
    marginTop: spacing.xs,
    color: colors.textMuted,
  },
  expandedContent: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  contentText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  viewFullLink: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  expandIcon: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  loadMoreButton: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  loadMoreText: {
    ...typography.button,
    color: colors.primary,
  },
  endText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
})

import { useEffect, useState } from 'react'
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Text } from 'react-native'
import { listReadingPlans, getPlanCompletionPercentage } from '@bible-notes/pocketbase-client'
import type { ReadingPlan } from '@bible-notes/shared'
import { router } from 'expo-router'
import { Card, CardTitle, CardSubtitle, Screen, EmptyState } from '../../components/ui'
import { colors, spacing } from '../../theme'

export default function ReadingPlansScreen() {
  const [plans, setPlans] = useState<ReadingPlan[]>([])
  const [percentages, setPercentages] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadPlans = async () => {
    try {
      const result = await listReadingPlans()
      setPlans(result)

      const pct: Record<string, number> = {}
      await Promise.all(
        result.map(async (plan) => {
          pct[plan.id] = await getPlanCompletionPercentage(plan.id)
        })
      )
      setPercentages(pct)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadPlans() }, [])

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
        onPress={() => router.push('/reading-plans/new')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <FlatList
        data={plans}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPlans() }} tintColor={colors.primary} />
        }
        ListEmptyComponent={<EmptyState title="No reading plans yet" subtitle="Tap the + button to start a new plan" />}
        renderItem={({ item }) => {
          const pct = percentages[item.id] || 0
          return (
            <Card onPress={() => router.push(`/reading-plans/${item.id}`)}>
              <CardTitle>{item.name}</CardTitle>
              <CardSubtitle>{item.total_days} days · Started {item.start_date}</CardSubtitle>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.progressText}>{Math.round(pct)}%</Text>
              </View>
            </Card>
          )
        }}
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
  fabText: {
    color: colors.textInverse,
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    minWidth: 32,
    textAlign: 'right',
  },
})

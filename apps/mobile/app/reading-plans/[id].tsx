import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native'
import { getReadingPlan, getPlanProgress, markDayComplete, deleteReadingPlan } from '@bible-notes/pocketbase-client'
import type { ReadingPlan } from '@bible-notes/shared'
import { useLocalSearchParams, router } from 'expo-router'
import { Button, Screen } from '../../components/ui'
import { colors, spacing, typography, shadows } from '../../theme'

export default function ReadingPlanDetail() {
  const { id } = useLocalSearchParams()
  const [plan, setPlan] = useState<ReadingPlan | null>(null)
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlan()
  }, [id])

  const loadPlan = async () => {
    try {
      const [planResult, progress] = await Promise.all([
        getReadingPlan(id as string),
        getPlanProgress(id as string),
      ])
      setPlan(planResult)
      setCompletedDays(new Set(progress.map((p) => p.day_number)))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    Alert.alert('Delete Plan', 'Are you sure you want to delete this reading plan?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReadingPlan(id as string)
            router.back()
          } catch (err) {
            console.error(err)
          }
        },
      },
    ])
  }

  const toggleDay = async (dayNumber: number) => {
    try {
      await markDayComplete(id as string, dayNumber)
      setCompletedDays((prev) => {
        const next = new Set(prev)
        if (next.has(dayNumber)) {
          next.delete(dayNumber)
        } else {
          next.add(dayNumber)
        }
        return next
      })
    } catch (err) {
      console.error(err)
    }
  }

  const completedCount = completedDays.size
  const totalDays = plan?.total_days || 0
  const progressPercent = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    )
  }

  if (!plan) {
    return (
      <Screen style={styles.center}>
        <Text style={styles.notFound}>Plan not found</Text>
      </Screen>
    )
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.name}>{plan.name}</Text>
          <Text style={styles.meta}>{totalDays} days · Started {plan.start_date}</Text>

          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>{completedCount} of {totalDays} days</Text>
              <Text style={styles.progressPercent}>{progressPercent}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.daysContainer}>
          {plan.plan_data.map((day) => {
            const isCompleted = completedDays.has(day.day)
            return (
              <TouchableOpacity
                key={day.day}
                style={[styles.dayCard, isCompleted && styles.dayCardCompleted]}
                onPress={() => toggleDay(day.day)}
                activeOpacity={0.85}
              >
                <View style={styles.dayLeft}>
                  <View style={[styles.dayCircle, isCompleted && styles.dayCircleCompleted]}>
                    <Text style={[styles.dayNumber, isCompleted && styles.dayNumberCompleted]}>{day.day}</Text>
                  </View>
                  <View style={styles.dayInfo}>
                    <Text style={[styles.dayLabel, isCompleted && styles.dayLabelCompleted]}>Day {day.day}</Text>
                    <Text style={styles.passages}>{day.passages.join(', ')}</Text>
                  </View>
                </View>
                {isCompleted && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkText}></Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={{ marginTop: spacing.lg, marginBottom: spacing.xxl }}>
          <Button title="Delete Plan" onPress={handleDelete} variant="ghost" />
        </View>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
  notFound: { ...typography.body, color: colors.textMuted },
  header: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  name: { ...typography.heading2, marginBottom: spacing.xs },
  meta: { ...typography.bodySmall, color: colors.textMuted, marginBottom: spacing.md },
  progressSection: { marginTop: spacing.sm },
  progressBar: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  progressText: { ...typography.caption, color: colors.textSecondary },
  progressPercent: { ...typography.caption, fontWeight: '700', color: colors.accentDark },
  daysContainer: { gap: spacing.sm },
  dayCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  dayCardCompleted: {
    backgroundColor: '#f0f9f4',
    borderWidth: 1.5,
    borderColor: colors.success + '30',
  },
  dayLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  dayCircleCompleted: { backgroundColor: colors.success + '15' },
  dayNumber: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  dayNumberCompleted: { color: colors.success },
  dayInfo: { flex: 1 },
  dayLabel: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 2 },
  dayLabelCompleted: { color: colors.success },
  passages: { fontSize: 13, color: colors.textMuted },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: colors.textInverse, fontSize: 14, fontWeight: '700' },
})

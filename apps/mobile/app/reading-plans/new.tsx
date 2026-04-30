import { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native'
import { router } from 'expo-router'
import { createReadingPlan } from '@bible-notes/pocketbase-client'
import type { ReadingPlanDay } from '@bible-notes/shared'
import { Input, Button, Screen } from '../../components/ui'
import { colors, spacing, typography } from '../../theme'

interface DayEntry {
  key: string
  day: number
  passages: string
}

let nextKey = 1

export default function NewReadingPlanScreen() {
  const [name, setName] = useState('')
  const [totalDays, setTotalDays] = useState('1')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [days, setDays] = useState<DayEntry[]>([{ key: 'day-0', day: 1, passages: '' }])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const syncDayCount = (count: number) => {
    setDays((prev) => {
      const updated = [...prev]
      if (count > updated.length) {
        for (let i = updated.length; i < count; i++) {
          updated.push({ key: `day-${nextKey++}`, day: i + 1, passages: '' })
        }
      } else if (count < updated.length) {
        return updated.slice(0, count).map((d, i) => ({ ...d, day: i + 1 }))
      }
      return updated.map((d, i) => ({ ...d, day: i + 1 }))
    })
  }

  const handleTotalDaysChange = (text: string) => {
    setTotalDays(text)
    const count = parseInt(text, 10)
    if (!isNaN(count) && count > 0) {
      syncDayCount(count)
    }
  }

  const updateDayPassages = (key: string, passages: string) => {
    setDays((prev) => prev.map((d) => (d.key === key ? { ...d, passages } : d)))
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    const dayCount = parseInt(totalDays, 10)
    if (isNaN(dayCount) || dayCount < 1) {
      setError('Total days must be a positive number')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const planData: ReadingPlanDay[] = days.map((d) => ({
        day: d.day,
        passages: d.passages
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean),
      }))
      await createReadingPlan({
        name: name.trim(),
        total_days: dayCount,
        start_date: startDate,
        plan_data: planData,
      })
      router.back()
    } catch (err) {
      setError('Failed to create reading plan')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.title}>New Reading Plan</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Input label="Name" value={name} onChangeText={setName} placeholder="Plan name" />
          <Input
            label="Total Days"
            value={totalDays}
            onChangeText={handleTotalDaysChange}
            placeholder="Number of days"
            keyboardType="number-pad"
          />
          <Input label="Start Date" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" />

          <Text style={styles.sectionHeader}>Daily Passages</Text>
          {days.map((day, index) => (
            <View key={day.key} style={styles.dayRow}>
              <Text style={styles.dayLabel}>Day {index + 1}</Text>
              <TextInput
                style={styles.dayInput}
                value={day.passages}
                onChangeText={(text) => updateDayPassages(day.key, text)}
                placeholder="Passages (comma-separated)"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          ))}

          <View style={styles.buttonRow}>
            <Button title={submitting ? 'Creating...' : 'Create Plan'} onPress={handleSubmit} loading={submitting} style={{ flex: 1 }} />
            <Button title="Cancel" onPress={() => router.back()} variant="outline" style={{ flex: 1 }} />
          </View>
        </View>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  form: {
    paddingTop: spacing.lg,
  },
  title: {
    ...typography.heading2,
    marginBottom: spacing.lg,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    marginBottom: spacing.md,
    backgroundColor: 'rgba(192,57,43,0.08)',
    padding: spacing.md,
    borderRadius: 12,
  },
  sectionHeader: {
    ...typography.heading3,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  dayRow: {
    marginBottom: spacing.md,
  },
  dayLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  dayInput: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
})

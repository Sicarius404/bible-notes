import { useState } from 'react'
import { View, Text, TextInput, Button, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { createReadingPlan } from '@bible-notes/pocketbase-client'
import type { ReadingPlanDay } from '@bible-notes/shared'

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
      setError('Failed to create')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>New Reading Plan</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Plan name"
      />

      <Text style={styles.label}>Total Days</Text>
      <TextInput
        style={styles.input}
        value={totalDays}
        onChangeText={handleTotalDaysChange}
        placeholder="Number of days"
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Start Date</Text>
      <TextInput
        style={styles.input}
        value={startDate}
        onChangeText={setStartDate}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.sectionHeader}>Days</Text>
      {days.map((day, index) => (
        <View key={day.key} style={styles.dayRow}>
          <Text style={styles.dayLabel}>Day {index + 1}</Text>
          <TextInput
            style={[styles.input, styles.dayInput]}
            value={day.passages}
            onChangeText={(text) => updateDayPassages(day.key, text)}
            placeholder="Passages (comma-separated)"
          />
        </View>
      ))}

      <Button title={submitting ? 'Creating...' : 'Create'} onPress={handleSubmit} disabled={submitting} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  textarea: { minHeight: 140 },
  error: { color: '#dc2626', marginBottom: 12 },
  sectionHeader: { fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 12 },
  dayRow: { marginBottom: 12 },
  dayLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4, color: '#555' },
  dayInput: { fontSize: 14 },
})

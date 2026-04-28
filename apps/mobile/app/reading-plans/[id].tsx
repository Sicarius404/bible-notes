import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Button, Alert } from 'react-native'
import { getReadingPlan, getPlanProgress, markDayComplete, deleteReadingPlan } from '@bible-notes/pocketbase-client'
import type { ReadingPlan } from '@bible-notes/shared'
import { useLocalSearchParams, router } from 'expo-router'

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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!plan) {
    return (
      <View style={styles.center}>
        <Text>Plan not found</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.name}>{plan.name}</Text>
      <Text style={styles.meta}>{plan.total_days} days · Started {plan.start_date}</Text>
      
      <View style={styles.daysContainer}>
        {plan.plan_data.map((day) => (
          <TouchableOpacity
            key={day.day}
            style={[styles.dayCard, completedDays.has(day.day) && styles.dayCardCompleted]}
            onPress={() => toggleDay(day.day)}
          >
            <Text style={styles.dayNumber}>Day {day.day}</Text>
            <Text style={styles.passages}>{day.passages.join(', ')}</Text>
            {completedDays.has(day.day) && <Text style={styles.completedBadge}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ marginTop: 16 }}>
        <Button title="Delete Plan" color="red" onPress={handleDelete} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 22, fontWeight: '600', marginBottom: 4 },
  meta: { fontSize: 14, color: '#666', marginBottom: 16 },
  daysContainer: { gap: 8 },
  dayCard: { padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayCardCompleted: { backgroundColor: '#dcfce7' },
  dayNumber: { fontSize: 14, fontWeight: '500' },
  passages: { fontSize: 12, color: '#666', flex: 1, marginLeft: 8 },
  completedBadge: { fontSize: 16, color: '#16a34a', fontWeight: 'bold' },
})

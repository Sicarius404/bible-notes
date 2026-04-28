import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import { listReadingPlans, getPlanCompletionPercentage } from '@bible-notes/pocketbase-client'
import type { ReadingPlan } from '@bible-notes/shared'
import { router } from 'expo-router'

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
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <FlatList
      data={plans}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPlans() }} />}
      ListHeaderComponent={
        <TouchableOpacity style={styles.newButton} onPress={() => router.push('/reading-plans/new')}>
          <Text style={styles.newButtonText}>+ New</Text>
        </TouchableOpacity>
      }
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/reading-plans/${item.id}`)}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>{item.total_days} days · Started {item.start_date}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${percentages[item.id] || 0}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(percentages[item.id] || 0)}% complete</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No reading plans yet</Text>}
    />
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  newButton: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, marginBottom: 8 },
  newButtonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  card: { padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '500' },
  meta: { fontSize: 13, color: '#666', marginTop: 4 },
  progressBar: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#2563eb', borderRadius: 3 },
  progressText: { fontSize: 12, color: '#666', marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
})

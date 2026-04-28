import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { getRevelation } from '@bible-notes/pocketbase-client'
import type { Revelation } from '@bible-notes/shared'
import { useLocalSearchParams } from 'expo-router'

export default function RevelationDetail() {
  const { id } = useLocalSearchParams()
  const [revelation, setRevelation] = useState<Revelation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRevelation()
  }, [id])

  const loadRevelation = async () => {
    try {
      const result = await getRevelation(id as string)
      setRevelation(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!revelation) {
    return (
      <View style={styles.center}>
        <Text>Revelation not found</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.date}>{revelation.date}</Text>
      <Text style={styles.content}>{revelation.content}</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  date: { fontSize: 14, color: '#666', marginBottom: 16 },
  content: { fontSize: 16, lineHeight: 24 },
})

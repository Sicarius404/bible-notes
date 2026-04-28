import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { listBibleNotes, listSermons, listRevelations, listReadingPlans } from '@bible-notes/pocketbase-client'
import type { BibleNote, Sermon, Revelation, ReadingPlan } from '@bible-notes/shared'
import { router } from 'expo-router'

export default function HomeScreen() {
  const [notes, setNotes] = useState<BibleNote[]>([])
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [revelations, setRevelations] = useState<Revelation[]>([])
  const [plans, setPlans] = useState<ReadingPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [n, s, r, p] = await Promise.all([
        listBibleNotes({ page: 1, per_page: 3 }),
        listSermons({ page: 1, per_page: 3 }),
        listRevelations({ page: 1, per_page: 3 }),
        listReadingPlans(),
      ])
      setNotes(n.items)
      setSermons(s.items)
      setRevelations(r.items)
      setPlans(p)
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>Welcome back</Text>
      
      <Text style={styles.sectionTitle}>Recent Notes</Text>
      {notes.map((note) => (
        <TouchableOpacity key={note.id} style={styles.card} onPress={() => router.push(`/bible-notes/${note.id}`)}>
          <Text style={styles.cardTitle}>{note.verse_refs?.[0] || 'Bible Note'}</Text>
          <Text style={styles.cardDate}>{note.date}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>Recent Sermons</Text>
      {sermons.map((sermon) => (
        <TouchableOpacity key={sermon.id} style={styles.card} onPress={() => router.push(`/sermons/${sermon.id}`)}>
          <Text style={styles.cardTitle}>{sermon.title}</Text>
          <Text style={styles.cardDate}>{sermon.pastor} · {sermon.date}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>Recent Revelations</Text>
      {revelations.map((rev) => (
        <TouchableOpacity key={rev.id} style={styles.card} onPress={() => router.push(`/revelations/${rev.id}`)}>
          <Text style={styles.cardTitle} numberOfLines={2}>{rev.content}</Text>
          <Text style={styles.cardDate}>{rev.date}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  greeting: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  card: { padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '500' },
  cardDate: { fontSize: 12, color: '#666', marginTop: 4 },
})

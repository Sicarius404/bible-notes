import { useCallback, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { listBibleNotes, listSermons, listRevelations, listReadingPlans } from '@bible-notes/pocketbase-client'
import type { BibleNote, Sermon, Revelation, ReadingPlan } from '@bible-notes/shared'
import { router } from 'expo-router'
import { Card, CardTitle, CardSubtitle, Screen, SectionHeader, EmptyState } from '../../components/ui'
import { colors, spacing, typography, shadows, radius } from '../../theme'
import { BookOpen, Mic, Church, FileText, CalendarDays } from 'lucide-react-native'

export default function HomeScreen() {
  const [notes, setNotes] = useState<BibleNote[]>([])
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [revelations, setRevelations] = useState<Revelation[]>([])
  const [plans, setPlans] = useState<ReadingPlan[]>([])
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [])
  )

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
      setPlans(p.slice(0, 2))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/bible-notes/new')}
            activeOpacity={0.8}
          >
            <View style={styles.quickIconWrapper}>
              <BookOpen size={22} color={colors.primary} />
            </View>
            <Text style={styles.quickBtnText}>New Note</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/sermons/new')}
            activeOpacity={0.8}
          >
            <View style={styles.quickIconWrapper}>
              <Mic size={22} color={colors.accent} />
            </View>
            <Text style={styles.quickBtnText}>Sermon</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: colors.success }]}
            onPress={() => router.push('/revelations/new')}
            activeOpacity={0.8}
          >
            <View style={styles.quickIconWrapper}>
              <Church size={22} color={colors.success} />
            </View>
            <Text style={styles.quickBtnText}>Revelation</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Notes */}
        <SectionHeader
          title="Recent Notes"
          action={
            <TouchableOpacity onPress={() => router.push('/bible-notes')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          }
        />
        {notes.length === 0 ? (
          <EmptyState
            title="No notes yet"
            subtitle='Tap "New Note" above to capture your first thoughts.'
            icon={<FileText size={40} color={colors.textMuted} />}
          />
        ) : (
          notes.map((note) => (
            <Card key={note.id} onPress={() => router.push(`/bible-notes/${note.id}`)}>
              <CardTitle>{note.verse_refs?.[0] || 'Bible Note'}</CardTitle>
              <CardSubtitle>{note.date}</CardSubtitle>
              <CardSubtitle style={{ marginTop: 4 }} numberOfLines={2}>
                {note.content}
              </CardSubtitle>
            </Card>
          ))
        )}

        {/* Recent Sermons */}
        <SectionHeader
          title="Recent Sermons"
          action={
            <TouchableOpacity onPress={() => router.push('/sermons')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          }
        />
        {sermons.length === 0 ? (
          <EmptyState
            title="No sermons logged"
            subtitle="Record your notes from Sunday service here."
            icon={<Mic size={40} color={colors.textMuted} />}
          />
        ) : (
          sermons.map((sermon) => (
            <Card key={sermon.id} onPress={() => router.push(`/sermons/${sermon.id}`)}>
              <CardTitle>{sermon.title}</CardTitle>
              <CardSubtitle>{sermon.pastor} · {sermon.date}</CardSubtitle>
            </Card>
          ))
        )}

        {/* Reading Plans */}
        {plans.length > 0 && (
          <>
            <SectionHeader
              title="Reading Plans"
              action={
                <TouchableOpacity onPress={() => router.push('/reading-plans')}>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              }
            />
            {plans.map((plan) => (
              <Card key={plan.id} onPress={() => router.push(`/reading-plans/${plan.id}`)}>
                <CardTitle>{plan.name}</CardTitle>
                <CardSubtitle>{plan.total_days} days · Started {plan.start_date}</CardSubtitle>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: 0,
  },

  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  quickBtn: {
    flex: 1,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    ...shadows.md,
  },
  quickIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  quickBtnText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  seeAll: {
    color: colors.primaryLight,
    fontWeight: '600',
    fontSize: 15,
  },
})

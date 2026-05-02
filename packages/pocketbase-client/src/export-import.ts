import { getPocketBase, escapeFilterValue } from './client'
import type { BibleNote, SmallGroupNote, Sermon, Revelation } from '@bible-notes/shared'
import { createBibleNote } from './bible-notes'
import { createSmallGroupNote } from './small-groups'
import { createSermon } from './sermons'
import { createRevelation } from './revelations'

export interface ExportData {
  exported_at: string
  bible_notes: BibleNote[]
  small_group_notes: SmallGroupNote[]
  sermons: Sermon[]
  revelations: Revelation[]
}

export interface ImportResult {
  bible_notes: number
  small_group_notes: number
  sermons: number
  revelations: number
  errors: string[]
}

export async function exportAllData(): Promise<ExportData> {
  const pb = getPocketBase()
  const userId = pb.authStore.record?.id
  if (!userId) throw new Error('Not authenticated')

  const [notes, groups, sermons, revelations] = await Promise.all([
    pb.collection('bible_notes').getFullList({ filter: `user_id = '${escapeFilterValue(userId)}'`, sort: '-date' }),
    pb.collection('small_group_notes').getFullList({ filter: `user_id = '${escapeFilterValue(userId)}'`, sort: '-date' }),
    pb.collection('sermons').getFullList({ filter: `user_id = '${escapeFilterValue(userId)}'`, sort: '-date' }),
    pb.collection('revelations').getFullList({ filter: `user_id = '${escapeFilterValue(userId)}'`, sort: '-date' }),
  ])

  return {
    exported_at: new Date().toISOString(),
    bible_notes: notes as unknown as BibleNote[],
    small_group_notes: groups as unknown as SmallGroupNote[],
    sermons: sermons as unknown as Sermon[],
    revelations: revelations as unknown as Revelation[],
  }
}

export async function importData(data: ExportData): Promise<ImportResult> {
  const result: ImportResult = {
    bible_notes: 0,
    small_group_notes: 0,
    sermons: 0,
    revelations: 0,
    errors: [],
  }

  if (data.bible_notes) {
    for (const note of data.bible_notes) {
      try {
        const title = note.title || (note.verse_refs?.[0]) || note.content?.slice(0, 40).trim() || 'Untitled Note'
        await createBibleNote({
          title,
          date: note.date,
          verse_refs: note.verse_refs || [],
          content: note.content,
        })
        result.bible_notes++
      } catch (err) {
        result.errors.push(`Bible note (${note.date}): ${err}`)
      }
    }
  }

  if (data.small_group_notes) {
    for (const note of data.small_group_notes) {
      try {
        await createSmallGroupNote({
          date: note.date,
          topic: note.topic,
          attendees: note.attendees,
          content: note.content,
        })
        result.small_group_notes++
      } catch (err) {
        result.errors.push(`Small group (${note.topic}): ${err}`)
      }
    }
  }

  if (data.sermons) {
    for (const sermon of data.sermons) {
      try {
        await createSermon({
          date: sermon.date,
          title: sermon.title,
          pastor: sermon.pastor,
          campus: sermon.campus,
          service_type: sermon.service_type,
          content: sermon.content,
        })
        result.sermons++
      } catch (err) {
        result.errors.push(`Sermon (${sermon.title}): ${err}`)
      }
    }
  }

  if (data.revelations) {
    for (const rev of data.revelations) {
      try {
        await createRevelation({
          date: rev.date,
          content: rev.content,
        })
        result.revelations++
      } catch (err) {
        result.errors.push(`Revelation (${rev.date}): ${err}`)
      }
    }
  }

  return result
}

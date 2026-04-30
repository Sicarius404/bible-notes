import { getPocketBase, escapeFilterValue } from './client'
import type { BibleNote, BibleNoteSearchParams } from '@bible-notes/shared'

const COLLECTION = 'bible_notes'

/**
 * Create a new Bible note.
 * user_id is auto-populated by PocketBase hooks from the auth context.
 */
export async function createBibleNote(data: {
  title: string
  date: string
  verse_refs: string[]
  content: string
}): Promise<BibleNote> {
  const pb = getPocketBase()
  const record = await pb.collection(COLLECTION).create({
    ...data,
    user_id: pb.authStore.record?.id,
  })
  return record as unknown as BibleNote
}

/**
 * Get a Bible note by ID.
 */
export async function getBibleNote(id: string): Promise<BibleNote> {
  const pb = getPocketBase()
  const record = await pb.collection(COLLECTION).getOne(id)
  return record as unknown as BibleNote
}

/**
 * Update a Bible note.
 */
export async function updateBibleNote(
  id: string,
  data: Partial<Pick<BibleNote, 'title' | 'date' | 'verse_refs' | 'content'>>
): Promise<BibleNote> {
  const pb = getPocketBase()
  const record = await pb.collection(COLLECTION).update(id, data)
  return record as unknown as BibleNote
}

/**
 * Delete a Bible note.
 */
export async function deleteBibleNote(id: string): Promise<void> {
  const pb = getPocketBase()
  await pb.collection(COLLECTION).delete(id)
}

/**
 * List Bible notes with optional search/filter.
 */
export async function listBibleNotes(params?: BibleNoteSearchParams): Promise<{
  items: BibleNote[]
  totalPages: number
  totalItems: number
  page: number
}> {
  const pb = getPocketBase()
  const page = params?.page || 1
  const perPage = params?.per_page || 20

  const filters: string[] = []

  const userId = pb.authStore.record?.id
  if (userId) {
    filters.push(`user_id = '${escapeFilterValue(userId)}'`)
  }

  if (params?.verse_ref) {
    filters.push(`verse_refs ~ '${escapeFilterValue(params.verse_ref)}'`)
  }

  if (params?.date_from) {
    filters.push(`date >= '${escapeFilterValue(params.date_from)}'`)
  }

  if (params?.date_to) {
    filters.push(`date <= '${escapeFilterValue(params.date_to)}'`)
  }

  if (params?.search) {
    filters.push(`(title ~ '${escapeFilterValue(params.search)}' || content ~ '${escapeFilterValue(params.search)}' || verse_refs ~ '${escapeFilterValue(params.search)}')`)
  }

  const result = await pb.collection(COLLECTION).getList(page, perPage, {
    filter: filters.length > 0 ? filters.join(' && ') : undefined,
    sort: '-date',
  })

  return {
    items: result.items as unknown as BibleNote[],
    totalPages: result.totalPages,
    totalItems: result.totalItems,
    page: result.page,
  }
}

/**
 * Get all unique verse references across all notes (for autocomplete).
 */
export async function getAllVerseRefs(): Promise<string[]> {
  const pb = getPocketBase()
  const filters: string[] = []
  const userId = pb.authStore.record?.id
  if (userId) {
    filters.push(`user_id = '${escapeFilterValue(userId)}'`)
  }
  const result = await pb.collection(COLLECTION).getFullList({
    fields: 'verse_refs',
    filter: filters.length > 0 ? filters.join(' && ') : undefined,
  })
  const refs = new Set<string>()
  for (const record of result) {
    const verseRefs = record.verse_refs as string[]
    if (Array.isArray(verseRefs)) {
      for (const ref of verseRefs) {
        refs.add(ref)
      }
    }
  }
  return Array.from(refs).sort()
}
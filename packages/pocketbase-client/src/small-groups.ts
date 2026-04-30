import { getPocketBase, escapeFilterValue } from './client'
import type { SmallGroupNote, SmallGroupSearchParams } from '@bible-notes/shared'

const COLLECTION = 'small_group_notes'

/**
 * Create a new small group note.
 * user_id is auto-populated by PocketBase hooks from the auth context.
 */
export async function createSmallGroupNote(data: {
  date: string
  topic: string
  attendees: string
  content: string
}): Promise<SmallGroupNote> {
  const pb = getPocketBase()
  const record = await pb.collection(COLLECTION).create({
    ...data,
    user_id: pb.authStore.record?.id,
  })
  return record as unknown as SmallGroupNote
}

export async function getSmallGroupNote(id: string): Promise<SmallGroupNote> {
  const pb = getPocketBase()
  const record = await pb.collection(COLLECTION).getOne(id)
  return record as unknown as SmallGroupNote
}

export async function updateSmallGroupNote(
  id: string,
  data: Partial<Pick<SmallGroupNote, 'date' | 'topic' | 'attendees' | 'content'>>
): Promise<SmallGroupNote> {
  const pb = getPocketBase()
  const record = await pb.collection(COLLECTION).update(id, data)
  return record as unknown as SmallGroupNote
}

export async function deleteSmallGroupNote(id: string): Promise<void> {
  const pb = getPocketBase()
  await pb.collection(COLLECTION).delete(id)
}

export async function listSmallGroupNotes(params?: SmallGroupSearchParams): Promise<{
  items: SmallGroupNote[]
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

  if (params?.topic) {
    filters.push(`topic ~ '${escapeFilterValue(params.topic)}'`)
  }

  if (params?.date_from) {
    filters.push(`date >= '${escapeFilterValue(params.date_from)}'`)
  }

  if (params?.date_to) {
    filters.push(`date <= '${escapeFilterValue(params.date_to)}'`)
  }

  if (params?.search) {
    filters.push(`content ~ '${escapeFilterValue(params.search)}'`)
  }

  const result = await pb.collection(COLLECTION).getList(page, perPage, {
    filter: filters.length > 0 ? filters.join(' && ') : undefined,
    sort: '-date',
  })

  return {
    items: result.items as unknown as SmallGroupNote[],
    totalPages: result.totalPages,
    totalItems: result.totalItems,
    page: result.page,
  }
}
import { getPocketBase, escapeFilterValue } from './client'
import type { Revelation, RevelationSearchParams } from '@bible-notes/shared'

const COLLECTION = 'revelations'

/**
 * Create a new revelation.
 * user_id is auto-populated by PocketBase hooks from the auth context.
 */
export async function createRevelation(data: {
  content: string
  date?: string
}): Promise<Revelation> {
  const pb = getPocketBase()
  const record = await pb.collection(COLLECTION).create({
    ...data,
    date: data.date || new Date().toISOString().split('T')[0],
    user_id: pb.authStore.record?.id,
  })
  return record as unknown as Revelation
}

export async function getRevelation(id: string): Promise<Revelation> {
  const pb = getPocketBase()
  const record = await pb.collection(COLLECTION).getOne(id)
  return record as unknown as Revelation
}

export async function updateRevelation(
  id: string,
  data: Partial<Pick<Revelation, 'content' | 'date'>>
): Promise<Revelation> {
  const pb = getPocketBase()
  const record = await pb.collection(COLLECTION).update(id, data)
  return record as unknown as Revelation
}

export async function deleteRevelation(id: string): Promise<void> {
  const pb = getPocketBase()
  await pb.collection(COLLECTION).delete(id)
}

export async function listRevelations(params?: RevelationSearchParams): Promise<{
  items: Revelation[]
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
    items: result.items as unknown as Revelation[],
    totalPages: result.totalPages,
    totalItems: result.totalItems,
    page: result.page,
  }
}
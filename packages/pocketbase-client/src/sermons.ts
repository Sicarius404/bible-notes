import { getPocketBase, escapeFilterValue } from './client'
import type { Sermon, SermonSearchParams, ServiceType } from '@bible-notes/shared'

const COLLECTION = 'sermons'

/**
 * Create a new sermon note.
 * user_id is auto-populated by PocketBase hooks from the auth context.
 */
export async function createSermon(data: {
  date: string
  title: string
  pastor: string
  campus: string
  service_type: ServiceType
  content: string
}): Promise<Sermon> {
  const pb = getPocketBase()
  const record = await pb.collection(COLLECTION).create({
    ...data,
    user_id: pb.authStore.record?.id,
  })
  return record as unknown as Sermon
}

export async function getSermon(id: string): Promise<Sermon> {
  const pb = getPocketBase()
  const record = await pb.collection(COLLECTION).getOne(id)
  return record as unknown as Sermon
}

export async function updateSermon(
  id: string,
  data: Partial<Pick<Sermon, 'date' | 'title' | 'pastor' | 'campus' | 'service_type' | 'content'>>
): Promise<Sermon> {
  const pb = getPocketBase()
  const record = await pb.collection(COLLECTION).update(id, data)
  return record as unknown as Sermon
}

export async function deleteSermon(id: string): Promise<void> {
  const pb = getPocketBase()
  await pb.collection(COLLECTION).delete(id)
}

export async function listSermons(params?: SermonSearchParams): Promise<{
  items: Sermon[]
  totalPages: number
  totalItems: number
  page: number
}> {
  const pb = getPocketBase()
  const page = params?.page || 1
  const perPage = params?.per_page || 20

  let filter = ''

  if (params?.pastor) {
    filter += `pastor ~ '${escapeFilterValue(params.pastor)}'`
  }

  if (params?.campus) {
    const campusFilter = `campus ~ '${escapeFilterValue(params.campus)}'`
    filter = filter ? `${filter} && ${campusFilter}` : campusFilter
  }

  if (params?.service_type) {
    const typeFilter = `service_type = '${escapeFilterValue(params.service_type)}'`
    filter = filter ? `${filter} && ${typeFilter}` : typeFilter
  }

  if (params?.date_from) {
    const fromFilter = `date >= '${escapeFilterValue(params.date_from)}'`
    filter = filter ? `${filter} && ${fromFilter}` : fromFilter
  }

  if (params?.date_to) {
    const toFilter = `date <= '${escapeFilterValue(params.date_to)}'`
    filter = filter ? `${filter} && ${toFilter}` : toFilter
  }

  if (params?.search) {
    const searchFilter = `content ~ '${escapeFilterValue(params.search)}'`
    filter = filter ? `${filter} && ${searchFilter}` : searchFilter
  }

  const result = await pb.collection(COLLECTION).getList(page, perPage, {
    filter: filter || undefined,
    sort: '-date',
  })

  return {
    items: result.items as unknown as Sermon[],
    totalPages: result.totalPages,
    totalItems: result.totalItems,
    page: result.page,
  }
}

/**
 * Get all unique campus names (for autocomplete/tag input).
 */
export async function getAllCampuses(): Promise<string[]> {
  const pb = getPocketBase()
  const result = await pb.collection(COLLECTION).getFullList({
    fields: 'campus',
  })
  const campuses = new Set<string>()
  for (const record of result) {
    if (record.campus) campuses.add(record.campus as string)
  }
  return Array.from(campuses).sort()
}

/**
 * Get all unique pastor names (for autocomplete).
 */
export async function getAllPastors(): Promise<string[]> {
  const pb = getPocketBase()
  const result = await pb.collection(COLLECTION).getFullList({
    fields: 'pastor',
  })
  const pastors = new Set<string>()
  for (const record of result) {
    if (record.pastor) pastors.add(record.pastor as string)
  }
  return Array.from(pastors).sort()
}
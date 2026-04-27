import { getPocketBase, escapeFilterValue } from './client'
import type { ReadingPlan, ReadingPlanProgress, ReadingPlanDay } from '@bible-notes/shared'

const PLANS_COLLECTION = 'reading_plans'
const PROGRESS_COLLECTION = 'reading_plan_progress'

// ─── Plans ───────────────────────────────────────────────────────────────────

/**
 * Create a new reading plan.
 * user_id is auto-populated by PocketBase hooks from the auth context.
 */
export async function createReadingPlan(data: {
  name: string
  total_days: number
  start_date: string
  plan_data: ReadingPlanDay[]
}): Promise<ReadingPlan> {
  const pb = getPocketBase()
  const record = await pb.collection(PLANS_COLLECTION).create({
    ...data,
    user_id: pb.authStore.record?.id,
  })
  return record as unknown as ReadingPlan
}

export async function getReadingPlan(id: string): Promise<ReadingPlan> {
  const pb = getPocketBase()
  const record = await pb.collection(PLANS_COLLECTION).getOne(id)
  return record as unknown as ReadingPlan
}

export async function updateReadingPlan(
  id: string,
  data: Partial<Pick<ReadingPlan, 'name' | 'total_days' | 'start_date' | 'plan_data'>>
): Promise<ReadingPlan> {
  const pb = getPocketBase()
  const record = await pb.collection(PLANS_COLLECTION).update(id, data)
  return record as unknown as ReadingPlan
}

export async function deleteReadingPlan(id: string): Promise<void> {
  const pb = getPocketBase()
  await pb.collection(PLANS_COLLECTION).delete(id)
}

export async function listReadingPlans(): Promise<ReadingPlan[]> {
  const pb = getPocketBase()
  const result = await pb.collection(PLANS_COLLECTION).getFullList({
    sort: '-created_at',
  })
  return result as unknown as ReadingPlan[]
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export async function markDayComplete(
  planId: string,
  dayNumber: number
): Promise<ReadingPlanProgress> {
  const pb = getPocketBase()

  // Check if progress record exists
  let existing: ReadingPlanProgress | null = null
  try {
    const result = await pb.collection(PROGRESS_COLLECTION).getFirstListItem(
      `plan_id = '${escapeFilterValue(planId)}' && day_number = ${dayNumber}`
    )
    existing = result as unknown as ReadingPlanProgress
  } catch {
    // No existing record
  }

  if (existing) {
    // Toggle: if already completed, uncomplete; otherwise complete
    const record = await pb.collection(PROGRESS_COLLECTION).update(existing.id, {
      completed: !existing.completed,
      completed_at: !existing.completed ? new Date().toISOString() : '',
    })
    return record as unknown as ReadingPlanProgress
  }

  // Create new progress record
  try {
    const record = await pb.collection(PROGRESS_COLLECTION).create({
      plan_id: planId,
      day_number: dayNumber,
      completed: true,
      completed_at: new Date().toISOString(),
      user_id: pb.authStore.record?.id,
    })
    return record as unknown as ReadingPlanProgress
  } catch (err: unknown) {
    // If unique constraint violation, the record was created concurrently;
    // treat as already completed and toggle it off
    const error = err as { response?: { message?: string }; message?: string }
    if (
      error?.response?.message?.includes('unique') ||
      error?.message?.includes('unique')
    ) {
      const result = await pb.collection(PROGRESS_COLLECTION).getFirstListItem(
        `plan_id = '${escapeFilterValue(planId)}' && day_number = ${dayNumber}`
      )
      const existing = result as unknown as ReadingPlanProgress
      const record = await pb.collection(PROGRESS_COLLECTION).update(existing.id, {
        completed: false,
        completed_at: '',
      })
      return record as unknown as ReadingPlanProgress
    }
    throw err
  }
}

export async function getPlanProgress(planId: string): Promise<ReadingPlanProgress[]> {
  const pb = getPocketBase()
  const result = await pb.collection(PROGRESS_COLLECTION).getFullList({
    filter: `plan_id = '${escapeFilterValue(planId)}'`,
    sort: 'day_number',
  })
  return result as unknown as ReadingPlanProgress[]
}

export async function getAllProgressRecords(): Promise<ReadingPlanProgress[]> {
  const pb = getPocketBase()
  const result = await pb.collection(PROGRESS_COLLECTION).getFullList({
    sort: 'day_number',
  })
  return result as unknown as ReadingPlanProgress[]
}

export async function getPlanCompletionPercentage(planId: string): Promise<number> {
  const plan = await getReadingPlan(planId)
  const progress = await getPlanProgress(planId)
  const completedDays = progress.filter((p) => p.completed).length
  return Math.round((completedDays / plan.total_days) * 100)
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

/**
 * Import a reading plan from seed JSON data.
 * Creates the plan and optionally sets the start_date to today.
 */
export async function importReadingPlan(
  planData: { name: string; total_days: number; days: ReadingPlanDay[] },
  startDate?: string
): Promise<ReadingPlan> {
  return createReadingPlan({
    name: planData.name,
    total_days: planData.total_days,
    start_date: startDate || new Date().toISOString().split('T')[0],
    plan_data: planData.days,
  })
}

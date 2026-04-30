import { z } from 'zod'
import { SERVICE_TYPES } from './constants'
import type { ServiceType } from './types'

export const bibleNoteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  content: z.string().min(1, 'Content is required'),
})

export const smallGroupNoteSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  topic: z.string().min(1, 'Topic is required'),
  attendees: z.string().min(1, 'Attendees are required'),
  content: z.string().min(1, 'Content is required'),
})

export const serviceTypeSchema = z.custom<ServiceType>(
  (value): value is ServiceType =>
    typeof value === 'string' && SERVICE_TYPES.includes(value as ServiceType),
  {
    message: 'Choose Morning, Evening, or Special.',
  }
)

export const sermonSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  title: z.string().min(1, 'Title is required'),
  pastor: z.string().min(1, 'Pastor is required'),
  campus: z.string().min(1, 'Campus is required'),
  service_type: serviceTypeSchema,
  content: z.string().min(1, 'Content is required'),
})

export const readingPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  total_days: z.coerce.number().min(1, 'Must be at least 1 day'),
  start_date: z.string().min(1, 'Start date is required'),
  days: z.array(
    z.object({
      passages: z.string(),
    })
  ),
})

export const revelationSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  content: z.string().min(1, 'Content is required'),
})

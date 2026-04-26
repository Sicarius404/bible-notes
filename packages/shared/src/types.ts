export interface BibleNote {
  id: string
  user_id: string
  date: string
  verse_refs: string[]
  content: string
  created_at: string
  updated_at: string
}

export interface SmallGroupNote {
  id: string
  user_id: string
  date: string
  topic: string
  attendees: string
  content: string
  created_at: string
  updated_at: string
}

export interface Sermon {
  id: string
  user_id: string
  date: string
  title: string
  pastor: string
  campus: string
  service_type: 'morning' | 'evening' | 'special'
  content: string
  created_at: string
  updated_at: string
}

export interface ReadingPlan {
  id: string
  user_id: string
  name: string
  total_days: number
  start_date: string
  plan_data: ReadingPlanDay[]
  created_at: string
  updated_at: string
}

export interface ReadingPlanDay {
  day: number
  passages: string[]
}

export interface ReadingPlanProgress {
  id: string
  plan_id: string
  user_id: string
  day_number: number
  completed: boolean
  completed_at: string
  created_at: string
  updated_at: string
}

export interface Revelation {
  id: string
  user_id: string
  date: string
  content: string
  created_at: string
  updated_at: string
}

export type ServiceType = 'morning' | 'evening' | 'special'

export interface VerseMatch {
  full: string
  book: string
  chapter: string
  verseStart: string
  verseEnd?: string
  chapterEnd?: string
}

export interface BibleNoteSearchParams {
  verse_ref?: string
  date_from?: string
  date_to?: string
  search?: string
  page?: number
  per_page?: number
}

export interface SermonSearchParams {
  pastor?: string
  campus?: string
  service_type?: ServiceType
  date_from?: string
  date_to?: string
  search?: string
  page?: number
  per_page?: number
}

export interface SmallGroupSearchParams {
  topic?: string
  date_from?: string
  date_to?: string
  search?: string
  page?: number
  per_page?: number
}

export interface RevelationSearchParams {
  date_from?: string
  date_to?: string
  search?: string
  page?: number
  per_page?: number
}

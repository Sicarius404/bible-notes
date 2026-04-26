export const DEFAULT_BIBLE_VERSION = 'NIV'

export const BIBLE_GATEWAY_BASE_URL = 'https://www.biblegateway.com/passage/'

export const SERVICE_TYPES = ['morning', 'evening', 'special'] as const

export const SERVICE_TYPE_LABELS: Record<(typeof SERVICE_TYPES)[number], string> = {
  morning: 'Morning',
  evening: 'Evening',
  special: 'Special',
}

export const CAMPUS_PRESETS: string[] = [
  // Campuses auto-populate from user input
  // These are just example defaults that can be customized
]

export const READING_PLAN_PRESETS = [
  { key: 'bible-in-90-days', name: 'Bible in 90 Days', totalDays: 90 },
  { key: 'bible-in-180-days', name: 'Bible in 180 Days', totalDays: 180 },
  { key: 'bible-in-365-days', name: 'Bible in 365 Days', totalDays: 365 },
  { key: 'nt-in-30-days', name: 'New Testament in 30 Days', totalDays: 30 },
] as const

export const APP_NAME = 'Bible Notes'

export const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: 'Home' },
  { href: '/bible-notes', label: 'Bible Notes', icon: 'BookOpen' },
  { href: '/small-groups', label: 'Small Groups', icon: 'Users' },
  { href: '/sermons', label: 'Sermons', icon: 'Church' },
  { href: '/reading-plans', label: 'Reading Plans', icon: 'CalendarCheck' },
  { href: '/revelations', label: 'Revelations', icon: 'Lightbulb' },
] as const

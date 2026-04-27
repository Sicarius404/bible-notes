import { BIBLE_GATEWAY_BASE_URL, DEFAULT_BIBLE_VERSION } from './constants'
import type { VerseMatch } from './types'

/**
 * Bible book names and their common abbreviations.
 * Keys are the full book name, values are arrays of accepted abbreviations.
 */
const BIBLE_BOOKS: Record<string, string[]> = {
  // Old Testament
  Genesis: ['Gen', 'Gn'],
  Exodus: ['Ex', 'Exod'],
  Leviticus: ['Lev', 'Lv'],
  Numbers: ['Num', 'Nm'],
  Deuteronomy: ['Deut', 'Dt'],
  Joshua: ['Josh', 'Jsh'],
  Judges: ['Judg', 'Jdg'],
  Ruth: ['Ru', 'Rth'],
  '1 Samuel': ['1 Sam', '1 Sm', '1Sa', 'I Sam', 'I Sa'],
  '2 Samuel': ['2 Sam', '2 Sm', '2Sa', 'II Sam', 'II Sa'],
  '1 Kings': ['1 Kgs', '1 Ki', '1Kg', 'I Kgs', 'I Ki'],
  '2 Kings': ['2 Kgs', '2 Ki', '2Kg', 'II Kgs', 'II Ki'],
  '1 Chronicles': ['1 Chr', '1 Ch', '1Ch', 'I Chr'],
  '2 Chronicles': ['2 Chr', '2 Ch', '2Ch', 'II Chr'],
  Ezra: ['Ezr', 'Ez'],
  Nehemiah: ['Neh', 'Ne'],
  Esther: ['Est', 'Es'],
  Job: ['Jb'],
  Psalms: ['Ps', 'Psl', 'Psm'],
  Psalm: ['Ps', 'Psl', 'Psm'],
  Proverbs: ['Prov', 'Prv', 'Pr'],
  Ecclesiastes: ['Eccl', 'Ecc', 'Ec'],
  'Song of Solomon': ['Song', 'SOS', 'Sg', 'Song of Songs', 'Canticles'],
  Isaiah: ['Isa', 'Is'],
  Jeremiah: ['Jer', 'Je', 'Jr'],
  Lamentations: ['Lam', 'La'],
  Ezekiel: ['Ezek', 'Eze', 'Ezk'],
  Daniel: ['Dan', 'Dn'],
  Hosea: ['Hos', 'Ho'],
  Joel: ['Jl'],
  Amos: ['Am'],
  Obadiah: ['Obad', 'Ob'],
  Jonah: ['Jon', 'Jnh'],
  Micah: ['Mic', 'Mi'],
  Nahum: ['Nah', 'Na'],
  Habakkuk: ['Hab', 'Hb'],
  Zephaniah: ['Zeph', 'Zep', 'Zp'],
  Haggai: ['Hag', 'Hg'],
  Zechariah: ['Zech', 'Zec', 'Zc'],
  Malachi: ['Mal', 'Ml'],
  // New Testament
  Matthew: ['Matt', 'Mt'],
  Mark: ['Mk', 'Mrk'],
  Luke: ['Lk', 'Lu'],
  John: ['Jn', 'Jhn'],
  Acts: ['Ac'],
  Romans: ['Rom', 'Rm', 'Rmns'],
  '1 Corinthians': ['1 Cor', '1Co', 'I Cor', 'I Co'],
  '2 Corinthians': ['2 Cor', '2Co', 'II Cor', 'II Co'],
  Galatians: ['Gal', 'Ga'],
  Ephesians: ['Eph', 'Ep'],
  Philippians: ['Phil', 'Php', 'Pp'],
  Colossians: ['Col', 'Co'],
  '1 Thessalonians': ['1 Thess', '1Th', 'I Thess'],
  '2 Thessalonians': ['2 Thess', '2Th', 'II Thess'],
  '1 Timothy': ['1 Tim', '1Ti', 'I Tim', 'I Ti'],
  '2 Timothy': ['2 Tim', '2Ti', 'II Tim', 'II Ti'],
  Titus: ['Tit', 'Ti'],
  Philemon: ['Phlm', 'Phm', 'Pm'],
  Hebrews: ['Heb', 'He'],
  James: ['Jas', 'Jm', 'Jms'],
  '1 Peter': ['1 Pet', '1Pe', 'I Pet', 'I Pe'],
  '2 Peter': ['2 Pet', '2Pe', 'II Pet', 'II Pe'],
  '1 John': ['1 Jn', '1Jn', 'I Jn', 'I Jo', '1 Joh'],
  '2 John': ['2 Jn', '2Jn', 'II Jn', 'II Jo', '2 Joh'],
  '3 John': ['3 Jn', '3Jn', 'III Jn', 'III Jo', '3 Joh'],
  Jude: ['Jud', 'Jd'],
  Revelation: ['Rev', 'Rv', 'Revelations'],
}

// Build a regex pattern that matches any book name or abbreviation
function buildBookPattern(): string {
  const allNames: string[] = []
  for (const [full, abbrevs] of Object.entries(BIBLE_BOOKS)) {
    allNames.push(escapeRegex(full))
    for (const abbr of abbrevs) {
      allNames.push(escapeRegex(abbr))
    }
  }
  // Sort by length descending so longer names match first (e.g., "1 Samuel" before "1 Sam")
  allNames.sort((a, b) => b.length - a.length)
  return allNames.join('|')
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Regex pattern to match Bible verse references.
 * Matches patterns like:
 * - John 3:16
 * - John 3:16-18
 * - John 3:16-4:2
 * - Genesis 1-3
 * - Psalm 23
 * - 1 John 2:3
 * - Ps 23:1-6
 */
const VERSE_REGEX = new RegExp(
  `(?<!\\w)(?:${buildBookPattern()})\\s+\\d{1,3}(?::\\d{1,3}(?:-\\d{1,3})?(?:,\\s*\\d{1,3}(?:-\\d{1,3})?)*|(?:-\\d{1,3})?)`,
  'g'
)

let PARSE_REGEX: RegExp | null = null

function getParseRegex(): RegExp {
  if (!PARSE_REGEX) {
    PARSE_REGEX = new RegExp(
      `^(?:${buildBookPattern()})\\s+(\\d{1,3})(?::(\\d{1,3})(?:-(\\d{1,3}))?|(?:-(\\d{1,3}))?)$`
    )
  }
  return PARSE_REGEX
}

/**
 * Find all Bible verse references in a text string.
 */
export function findVerseReferences(text: string): VerseMatch[] {
  const matches: VerseMatch[] = []
  let match: RegExpExecArray | null

  // Reset regex lastIndex
  VERSE_REGEX.lastIndex = 0

  while ((match = VERSE_REGEX.exec(text)) !== null) {
    const full = match[0]
    const parsed = parseVerseReference(full)
    if (parsed) {
      matches.push(parsed)
    }
  }

  return matches
}

/**
 * Parse a verse reference string into its components.
 */
export function parseVerseReference(ref: string): VerseMatch | null {
  // Match: BookName Chapter:VerseStart(-VerseEnd?) or BookName Chapter(-ChapterEnd?)
  const pattern = getParseRegex()
  const match = ref.trim().match(pattern)

  if (!match) return null

  const book = resolveBookName(ref.trim().split(/\s+\d/)[0])
  if (!book) return null

  const chapter = match[1]
  const verseStart = match[2] || ''
  const verseEnd = match[3] || undefined
  const chapterEnd = match[4] || undefined

  return {
    full: ref.trim(),
    book,
    chapter,
    verseStart,
    verseEnd,
    chapterEnd,
  }
}

/**
 * Resolve a book name or abbreviation to the full book name.
 */
function resolveBookName(nameOrAbbr: string): string | null {
  const normalized = nameOrAbbr.trim()

  for (const [full, abbrevs] of Object.entries(BIBLE_BOOKS)) {
    if (full.toLowerCase() === normalized.toLowerCase()) return full
    if (abbrevs.some((a) => a.toLowerCase() === normalized.toLowerCase())) return full
  }

  return null
}

/**
 * Generate a Bible Gateway URL for a verse reference.
 */
export function verseToUrl(ref: string, version?: string): string {
  const v = version || DEFAULT_BIBLE_VERSION
  const encoded = encodeURIComponent(ref)
  return `${BIBLE_GATEWAY_BASE_URL}?search=${encoded}&version=${v}`
}

/**
 * Escape HTML special characters to prevent XSS.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Replace all Bible verse references in text with hyperlinks.
 * Input is HTML-escaped first to prevent XSS, then verse references are linkified.
 */
export function linkifyVerses(text: string, version?: string): string {
  // First, escape all HTML in the input to prevent XSS
  const escaped = escapeHtml(text)

  // Then, replace verse references in the escaped text
  VERSE_REGEX.lastIndex = 0
  return escaped.replace(VERSE_REGEX, (match) => {
    const url = verseToUrl(match, version)
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="verse-link">${match}</a>`
  })
}

/**
 * Extract just the reference strings from text (for storing in verse_refs array).
 */
export function extractVerseRefs(text: string): string[] {
  const matches = findVerseReferences(text)
  return matches.map((m) => m.full)
}

/**
 * Search text for a verse reference query (partial match).
 * e.g., "Romans 8" matches "Romans 8:1", "Romans 8:28", etc.
 */
export function verseRefMatchesQuery(ref: string, query: string): boolean {
  const normalizedRef = ref.toLowerCase().trim()
  const normalizedQuery = query.toLowerCase().trim()
  return normalizedRef.startsWith(normalizedQuery) || normalizedRef.includes(normalizedQuery)
}
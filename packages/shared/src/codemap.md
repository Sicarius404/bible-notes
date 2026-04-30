# packages/shared/src/

## Responsibility
Central repository of shared types, constants, validation rules, and Bible verse utilities. Every export here defines how application entities are shaped, validated, and displayed.

## Files

### `index.ts` — Barrel module
Re-exports all public symbols from `types`, `constants`, `verse-parser`, and `validation`. Consumers should never import from individual files directly.

### `types.ts` — All data entity interfaces
Defines the shape of every record stored in PocketBase. Each interface corresponds 1:1 with a PocketBase collection:

| Export | Collection | Key Fields |
|--------|-----------|------------|
| `BibleNote` | `bible_notes` | `verse_refs: string[]`, `content`, `date` |
| `SmallGroupNote` | `small_group_notes` | `topic`, `attendees`, `content` |
| `Sermon` | `sermons` | `title`, `pastor`, `campus`, `service_type` |
| `ReadingPlan` | `reading_plans` | `name`, `total_days`, `start_date`, `plan_data: ReadingPlanDay[]` |
| `ReadingPlanDay` | (embedded) | `day`, `passages: string[]` |
| `ReadingPlanProgress` | `reading_plan_progress` | `plan_id`, `day_number`, `completed`, `completed_at` |
| `Revelation` | `revelations` | `content`, `date` |

Also defines search parameter interfaces for each entity (`BibleNoteSearchParams`, `SermonSearchParams`, `SmallGroupSearchParams`, `RevelationSearchParams`) with filter fields (date range, text search, pagination). The `VerseMatch` interface holds parsed verse reference components (book, chapter, verse range). `ServiceType` is a union type of `'morning' | 'evening' | 'special'`.

### `constants.ts` — Application-wide constants
- `DEFAULT_BIBLE_VERSION` — Defaults to `'NIV'`
- `BIBLE_GATEWAY_BASE_URL` — Base URL for Bible Gateway links
- `SERVICE_TYPES` — Tuple `['morning', 'evening', 'special']`
- `SERVICE_TYPE_LABELS` — Human-readable label map for each service type
- `READING_PLAN_PRESETS` — Predefined plan configurations (90/180/365 day Bibles, NT in 30 days)
- `APP_NAME` — `'Bible Notes'`
- `NAV_ITEMS` — Navigation menu structure with href, label, and icon name for each route

### `validation.ts` — Zod validation schemas
Each schema mirrors the corresponding TypeScript interface and provides constraint rules and error messages:

| Export | Validates | Constraints |
|--------|-----------|-------------|
| `bibleNoteSchema` | Bible note form | `date` + `content` required, non-empty |
| `smallGroupNoteSchema` | Small group form | `date`, `topic`, `attendees`, `content` required |
| `sermonSchema` | Sermon form | All fields required; `service_type` validated via custom enum check |
| `readingPlanSchema` | Reading plan form | `name` required, `total_days` ≥ 1 (coerced from string), `start_date` required, `days` array of passage objects |
| `revelationSchema` | Revelation form | `date` + `content` required |
| `serviceTypeSchema` | Service type enum | Custom Zod validator checking `SERVICE_TYPES` inclusion |

### `verse-parser.ts` — Bible reference engine
The most complex module in the package. Contains a registry of 70 Bible books with full names and abbreviations, and regex-based parsing logic.

**Key exports:**

- `findVerseReferences(text: string): VerseMatch[]` — Extracts all verse references from arbitrary text using a global regex. Scans for patterns like `"John 3:16"`, `"1 Cor 13:4-7"`, `"Psalm 23"`.

- `parseVerseReference(ref: string): VerseMatch | null` — Parses a single reference string into structured `{book, chapter, verseStart, verseEnd?, chapterEnd?}`. Handles single verses, verse ranges, and chapter ranges.

- `verseToUrl(ref: string, version?: string): string` — Generates a Bible Gateway URL for a reference (e.g., `https://www.biblegateway.com/passage/?search=John%203%3A16&version=NIV`).

- `linkifyVerses(text: string, version?: string): string` — HTML-safe function that escapes input for XSS prevention, then replaces all verse references with `<a>` links targeting Bible Gateway. Used for rendering note content.

- `extractVerseRefs(text: string): string[]` — Convenience wrapper returning just the matched reference strings (used to populate `verse_refs` arrays on notes).

- `verseRefMatchesQuery(ref: string, query: string): boolean` — Partial-matching utility for autocomplete/search filtering.

**Internal details:**
- `BIBLE_BOOKS` — Record mapping canonical book names to arrays of abbreviations (e.g., `"1 John" → ["1 Jn", "1Jn", "I Jn", ...]`). Covers all 66 canonical books plus variant name forms (e.g., `"Psalm"` and `"Psalms"`).
- `buildBookPattern()` — Generates a regex alternation string, sorting names longest-first to prevent partial matches (e.g., match `"1 Samuel"` before `"1 Sam"`).
- `VERSE_REGEX` — Compiled global regex for scanning text: `Book Chapter:Verse-Verse` or `Book Chapter-Chapter` patterns.
- `PARSE_REGEX` — Lazy-compiled anchored regex for parsing individual references.

## Integration
- **Depended on by:** `@bible-notes/pocketbase-client`, `apps/web` (forms, display components, search)
- **Depends on:** `zod` (validation), no other runtime deps

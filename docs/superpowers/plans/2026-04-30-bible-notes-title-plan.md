# Bible Notes Title + Collapsible List + Mobile Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a required `title` field to Bible notes, redesign the list view with collapsible cards, and add pagination to the mobile notes list.

**Architecture:** Extend the existing `bible_notes` PocketBase collection with a `title` field, update all CRUD layers (shared types, validation, client API), and refactor the web and mobile list UIs to show title-first collapsible cards.

**Tech Stack:** Next.js (App Router), React Native (Expo), PocketBase, Zod, TanStack Query, Tailwind CSS

---

## File Structure

| File | Responsibility |
|------|---------------|
| `server/pb_migrations/002_add_title_to_bible_notes.js` | PocketBase migration: add `title` field and backfill existing records |
| `packages/shared/src/types.ts` | `BibleNote` interface: add `title: string` |
| `packages/shared/src/validation.ts` | `bibleNoteSchema`: add required `title` field |
| `packages/pocketbase-client/src/bible-notes.ts` | CRUD functions: include `title`; update search filter to cover `title` |
| `packages/pocketbase-client/src/export-import.ts` | Export/import: include `title`; handle missing title on import |
| `apps/web/src/app/(app)/bible-notes/new/page.tsx` | Create note form: add Title input field |
| `apps/web/src/app/(app)/bible-notes/[id]/page.tsx` | Edit note form: add Title input field |
| `apps/web/src/app/(app)/bible-notes/page.tsx` | List page: collapsible cards showing title, verse refs, date |
| `apps/web/src/app/(app)/page.tsx` | Dashboard: show title in Recent Notes cards |
| `apps/mobile/app/bible-notes/new.tsx` | Mobile create screen: add Title input |
| `apps/mobile/app/bible-notes/[id].tsx` | Mobile edit screen: add Title input |
| `apps/mobile/app/(tabs)/bible-notes.tsx` | Mobile list screen: collapsible cards + Load More pagination |

---

### Task 1: PocketBase Migration — Add `title` Field

**Files:**
- Create: `server/pb_migrations/002_add_title_to_bible_notes.js`

- [ ] **Step 1: Write the migration file**

```javascript
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId('bible_notes')

  // Add title field
  collection.schema.addField(new SchemaField({
    system: false,
    id: 'title_field',
    name: 'title',
    type: 'text',
    required: true,
    unique: false,
    options: {
      min: 1,
      max: 255,
      pattern: '',
    },
  }))

  dao.saveCollection(collection)

  // Backfill existing records with generated titles
  const records = dao.findRecordsByFilter('bible_notes', '', '', 0, 0)
  for (const record of records) {
    const verseRefs = record.get('verse_refs') || []
    const content = record.get('content') || ''
    const generatedTitle = verseRefs[0] || content.slice(0, 40).trim() || 'Untitled Note'
    record.set('title', generatedTitle)
    dao.saveRecord(record)
  }
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId('bible_notes')
  collection.schema.removeField('title_field')
  dao.saveCollection(collection)
})
```

- [ ] **Step 2: Verify migration syntax**

Check that the migration follows the same pattern as `001_init_collections.js` in the same directory.

- [ ] **Step 3: Commit**

```bash
git add server/pb_migrations/002_add_title_to_bible_notes.js
git commit -m "feat(migration): add title field to bible_notes with backfill"
```

---

### Task 2: Shared Types — Add `title` to `BibleNote`

**Files:**
- Modify: `packages/shared/src/types.ts`

- [ ] **Step 1: Update the `BibleNote` interface**

```typescript
export interface BibleNote {
  id: string
  user_id: string
  title: string
  date: string
  verse_refs: string[]
  content: string
  created_at: string
  updated_at: string
}
```

Replace the existing `BibleNote` interface (lines 1-9) with the version above.

- [ ] **Step 2: Commit**

```bash
git add packages/shared/src/types.ts
git commit -m "feat(types): add title to BibleNote interface"
```

---

### Task 3: Shared Validation — Add Required `title` to Schema

**Files:**
- Modify: `packages/shared/src/validation.ts`

- [ ] **Step 1: Update `bibleNoteSchema`**

```typescript
export const bibleNoteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  content: z.string().min(1, 'Content is required'),
})
```

Replace the existing `bibleNoteSchema` (lines 5-8) with the version above.

- [ ] **Step 2: Commit**

```bash
git add packages/shared/src/validation.ts
git commit -m "feat(validation): require title in bibleNoteSchema"
```

---

### Task 4: PocketBase Client — Include `title` in CRUD and Search

**Files:**
- Modify: `packages/pocketbase-client/src/bible-notes.ts`

- [ ] **Step 1: Update `createBibleNote` and `updateBibleNote` signatures**

Find the `createBibleNote` function and ensure it accepts `title`. The existing implementation likely passes the data object directly to `pb.collection('bible_notes').create(data)`. Since `data` is already typed from the shared package, TypeScript will catch missing `title` once the types are updated. No code change is strictly needed inside `createBibleNote` and `updateBibleNote` if they accept a generic data object, but verify the function signatures accept the updated type.

If the functions have explicit inline parameter types, update them:

```typescript
export async function createBibleNote(data: {
  title: string
  date: string
  verse_refs: string[]
  content: string
}) {
  return pb.collection('bible_notes').create(data)
}

export async function updateBibleNote(
  id: string,
  data: Partial<{
    title: string
    date: string
    verse_refs: string[]
    content: string
  }>
) {
  return pb.collection('bible_notes').update(id, data)
}
```

- [ ] **Step 2: Update the `listBibleNotes` search filter to include `title`**

Find the `listBibleNotes` function. Locate the filter string construction for the `search` parameter. Update it to also search in `title`.

If the current filter looks like:
```typescript
filter.push(`(content ~ "${params.search}" || verse_refs ~ "${params.search}")`)
```

Change it to:
```typescript
filter.push(`(title ~ "${params.search}" || content ~ "${params.search}" || verse_refs ~ "${params.search}")`)
```

- [ ] **Step 3: Commit**

```bash
git add packages/pocketbase-client/src/bible-notes.ts
git commit -m "feat(client): include title in bible notes CRUD and search filter"
```

---

### Task 5: PocketBase Client — Handle `title` in Export/Import

**Files:**
- Modify: `packages/pocketbase-client/src/export-import.ts`

- [ ] **Step 1: Verify export includes `title`**

The export code likely uses `pb.collection('bible_notes').getFullList()` which returns all fields including the new `title`. No change needed unless fields are explicitly whitelisted.

- [ ] **Step 2: Update import to handle missing `title`**

Find the import logic. When creating imported Bible notes, if the imported record is missing `title`, generate one before calling `createBibleNote`:

```typescript
const title = note.title || (note.verse_refs?.[0]) || note.content?.slice(0, 40).trim() || 'Untitled Note'
await createBibleNote({
  title,
  date: note.date,
  verse_refs: note.verse_refs || [],
  content: note.content,
})
```

- [ ] **Step 3: Commit**

```bash
git add packages/pocketbase-client/src/export-import.ts
git commit -m "feat(import): handle missing title on bible note import"
```

---

### Task 6: Web — Add Title Input to Create Note Form

**Files:**
- Modify: `apps/web/src/app/(app)/bible-notes/new/page.tsx`

- [ ] **Step 1: Add Title input field**

After the `<form>` opening tag and inside the first `<CardContent>`, add a Title input before the Date input:

```tsx
{/* Title */}
<div className="space-y-2">
  <Label htmlFor="title">Title</Label>
  <Input
    id="title"
    placeholder="e.g. The Power of Grace"
    {...register('title')}
  />
  {errors.title && (
    <p className="text-sm text-destructive">{errors.title.message}</p>
  )}
</div>
```

- [ ] **Step 2: Update the mutation payload to include `title`**

In the `onSubmit` handler, update the `mutate` call:

```typescript
const onSubmit = (data: FormData) => {
  mutation.mutate({
    title: data.title,
    date: data.date,
    verse_refs: verseRefs,
    content: data.content,
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/(app)/bible-notes/new/page.tsx
git commit -m "feat(web): add title input to bible note create form"
```

---

### Task 7: Web — Add Title Input to Edit Note Form

**Files:**
- Modify: `apps/web/src/app/(app)/bible-notes/[id]/page.tsx`

- [ ] **Step 1: Add Title input field**

Locate the edit form (likely inside a conditional `isEditing` block). Add a Title input in the same pattern as Task 6, pre-filled from `note.title`.

If the form uses `useForm`, set the default value:

```typescript
defaultValues: {
  title: note.title,
  date: note.date,
  content: note.content,
}
```

Add the JSX:

```tsx
<div className="space-y-2">
  <Label htmlFor="title">Title</Label>
  <Input id="title" {...register('title')} />
  {errors.title && (
    <p className="text-sm text-destructive">{errors.title.message}</p>
  )}
</div>
```

- [ ] **Step 2: Update the update mutation to include `title`**

```typescript
updateBibleNote(note.id, {
  title: data.title,
  date: data.date,
  verse_refs: verseRefs,
  content: data.content,
})
```

- [ ] **Step 3: Update the read-only view to show the title**

Locate the non-editing view of the note. Add a prominent title display:

```tsx
<h2 className="text-2xl font-semibold">{note.title}</h2>
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/(app)/bible-notes/[id]/page.tsx
git commit -m "feat(web): add title input and display to bible note detail/edit"
```

---

### Task 8: Web — Redesign List Page with Collapsible Cards

**Files:**
- Modify: `apps/web/src/app/(app)/bible-notes/page.tsx`

- [ ] **Step 1: Add expand/collapse state**

Import `useState` (already imported) and `ChevronDown`, `ChevronUp` from `lucide-react`:

```tsx
import { Search, Plus, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
```

Add state inside the component:

```tsx
const [expandedId, setExpandedId] = useState<string | null>(null)
```

- [ ] **Step 2: Redesign the card rendering**

Replace the existing card map with collapsible cards. The card should no longer be wrapped in `<Link>` for the whole card; instead, the title area can link to the detail page, or keep the whole card clickable but toggle expansion on click:

```tsx
<div className="space-y-3">
  {data?.items.map((note: BibleNote) => {
    const isExpanded = expandedId === note.id
    return (
      <Card
        key={note.id}
        className="hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => setExpandedId(isExpanded ? null : note.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-base">{note.title}</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {note.verse_refs.map((ref) => (
                  <Badge key={ref} variant="secondary">{ref}</Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(note.date), 'MMMM d, yyyy')}
              </p>
            </div>
            <div className="ml-2 mt-1">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>

          {isExpanded && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {note.content}
              </p>
              <div className="mt-3">
                <Link href={`/bible-notes/${note.id}`}>
                  <Button variant="outline" size="sm">View Full Note</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  })}
</div>
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/(app)/bible-notes/page.tsx
git commit -m "feat(web): collapsible bible note cards with title-first layout"
```

---

### Task 9: Web — Update Dashboard Recent Notes

**Files:**
- Modify: `apps/web/src/app/(app)/page.tsx`

- [ ] **Step 1: Update Recent Notes card to show title**

Locate the Recent Notes section. Replace content preview with the note title:

```tsx
<h3 className="font-semibold">{note.title}</h3>
<div className="flex flex-wrap gap-1 mt-1">
  {note.verse_refs.map((ref) => (
    <Badge key={ref} variant="secondary" className="text-xs">{ref}</Badge>
  ))}
</div>
<p className="text-xs text-muted-foreground mt-1">
  {format(new Date(note.date), 'MMM d, yyyy')}
</p>
```

Remove any `line-clamp-2` content preview.

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/(app)/page.tsx
git commit -m "feat(web): show title in dashboard recent notes"
```

---

### Task 10: Mobile — Add Title Input to Create Note Screen

**Files:**
- Modify: `apps/mobile/app/bible-notes/new.tsx`

- [ ] **Step 1: Add Title input**

Add a `TextInput` for title at the top of the form, before the date input. Update the `useState` and submit handler to include `title`:

```typescript
const [title, setTitle] = useState('')
```

In the submit handler:

```typescript
await createBibleNote({
  title: title.trim(),
  date,
  verse_refs: verseRefs,
  content,
})
```

Add validation before submit:

```typescript
if (!title.trim()) {
  Alert.alert('Error', 'Title is required')
  return
}
```

Add the JSX:

```tsx
<TextInput
  style={[styles.input, { marginBottom: spacing.md }]}
  placeholder="Title"
  value={title}
  onChangeText={setTitle}
/>
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/bible-notes/new.tsx
git commit -m "feat(mobile): add title input to bible note create screen"
```

---

### Task 11: Mobile — Add Title Input to Edit Note Screen

**Files:**
- Modify: `apps/mobile/app/bible-notes/[id].tsx`

- [ ] **Step 1: Add Title input**

Add `title` to the component state:

```typescript
const [title, setTitle] = useState(note?.title || '')
```

In the update handler:

```typescript
await updateBibleNote(id, {
  title: title.trim(),
  date,
  verse_refs: verseRefs,
  content,
})
```

Add validation:

```typescript
if (!title.trim()) {
  Alert.alert('Error', 'Title is required')
  return
}
```

Add the JSX:

```tsx
<TextInput
  style={[styles.input, { marginBottom: spacing.md }]}
  placeholder="Title"
  value={title}
  onChangeText={setTitle}
/>
```

- [ ] **Step 2: Update the read-only view to show title**

In the non-editing view, display the title prominently:

```tsx
<Text style={[typography.heading3, { marginBottom: spacing.sm }]}>{note.title}</Text>
```

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/app/bible-notes/[id].tsx
git commit -m "feat(mobile): add title input and display to bible note detail/edit"
```

---

### Task 12: Mobile — Redesign List Screen with Collapsible Cards + Pagination

**Files:**
- Modify: `apps/mobile/app/(tabs)/bible-notes.tsx`

- [ ] **Step 1: Add pagination and expansion state**

Update state:

```typescript
const [notes, setNotes] = useState<BibleNote[]>([])
const [page, setPage] = useState(1)
const [hasMore, setHasMore] = useState(true)
const [expandedId, setExpandedId] = useState<string | null>(null)
```

- [ ] **Step 2: Update `loadNotes` to support pagination**

```typescript
const loadNotes = async (nextPage = 1, append = false) => {
  try {
    setLoading(true)
    const result = await listBibleNotes({ page: nextPage, per_page: 10 })
    if (append) {
      setNotes((prev) => [...prev, ...result.items])
    } else {
      setNotes(result.items)
    }
    setPage(nextPage)
    setHasMore(result.items.length === 10)
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
    setRefreshing(false)
  }
}
```

Update the initial load:

```typescript
useEffect(() => { loadNotes(1, false) }, [])
```

Update refresh:

```typescript
refreshControl={
  <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadNotes(1, false) }} tintColor={colors.primary} />
}
```

- [ ] **Step 3: Redesign renderItem to be collapsible**

```tsx
renderItem={({ item }) => {
  const isExpanded = expandedId === item.id
  return (
    <Card onPress={() => setExpandedId(isExpanded ? null : item.id)}>
      <CardTitle style={{ color: colors.primary }}>{item.title}</CardTitle>
      <CardSubtitle>{item.verse_refs?.join(', ') || ''}</CardSubtitle>
      <CardSubtitle>{item.date}</CardSubtitle>
      {isExpanded && (
        <View style={{ marginTop: spacing.sm }}>
          <Text style={{ color: colors.text, fontSize: 14 }}>{item.content}</Text>
          <TouchableOpacity
            onPress={() => router.push(`/bible-notes/${item.id}`)}
            style={{ marginTop: spacing.sm }}
          >
            <Text style={{ color: colors.primary, fontSize: 14 }}>View Full Note</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  )
}}
```

- [ ] **Step 4: Add Load More button**

After the `FlatList`, add a Load More button:

```tsx
{hasMore && (
  <TouchableOpacity
    onPress={() => loadNotes(page + 1, true)}
    style={styles.loadMoreButton}
  >
    <Text style={styles.loadMoreText}>Load More</Text>
  </TouchableOpacity>
)}
```

Add styles:

```tsx
loadMoreButton: {
  padding: spacing.md,
  alignItems: 'center',
  backgroundColor: colors.card,
  marginHorizontal: spacing.md,
  marginBottom: spacing.md,
  borderRadius: 8,
},
loadMoreText: {
  color: colors.primary,
  fontSize: 16,
  fontWeight: '600',
},
```

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/app/(tabs)/bible-notes.tsx
git commit -m "feat(mobile): collapsible bible note cards with load-more pagination"
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|---|---|
| Add `title` field to PocketBase schema | Task 1 |
| Backfill existing notes with generated title | Task 1 |
| Add `title` to `BibleNote` interface | Task 2 |
| Add `title` to `bibleNoteSchema` | Task 3 |
| Include `title` in CRUD and search filter | Task 4 |
| Handle `title` in export/import | Task 5 |
| Web create form: Title input | Task 6 |
| Web edit form: Title input | Task 7 |
| Web list: collapsible title-first cards | Task 8 |
| Web dashboard: show title | Task 9 |
| Mobile create: Title input | Task 10 |
| Mobile edit: Title input | Task 11 |
| Mobile list: collapsible + pagination | Task 12 |

## Placeholder Scan

- No "TBD", "TODO", or "implement later" found.
- All steps contain exact file paths and code.
- All commit messages are present.
- Type consistency: `title` is `string` everywhere.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-30-bible-notes-title-plan.md`.**

Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
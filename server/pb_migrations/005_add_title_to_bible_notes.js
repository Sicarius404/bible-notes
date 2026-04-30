// PocketBase Migration 005: Add `title` field to bible_notes collection
// Adds a required text field with max 255 chars, then backfills
// existing records with a generated title based on verse_refs or content.

migrate((app) => {
  // ── Add title field ─────────────────────────────────────────────────────
  const collection = app.findCollectionByNameOrId("bible_notes")

  collection.fields.add(new TextField({
    name: "title",
    required: true,
    max: 255,
  }))

  app.save(collection)

  // ── Backfill existing records ───────────────────────────────────────────
  const records = app.findAllRecords("bible_notes")

  for (const record of records) {
    if (!record.get("title")) {
      let title

      // Try first verse ref as the title
      const verseRefs = record.get("verse_refs")
      if (verseRefs && Array.isArray(verseRefs) && verseRefs.length > 0) {
        title = String(verseRefs[0])
      }

      // Fall back to first 40 chars of content
      if (!title) {
        const content = record.get("content") || ""
        title = content.substring(0, 40).trim()
      }

      // Last resort fallback
      if (!title) {
        title = "Untitled Note"
      }

      record.set("title", title)
      app.save(record)
    }
  }
}, (app) => {
  // ── Down: Remove the title field ───────────────────────────────────────
  const collection = app.findCollectionByNameOrId("bible_notes")
  const titleField = collection.fields.getByName("title")
  collection.fields.remove(titleField)
  app.save(collection)
})

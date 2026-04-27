// Bible Notes App - Initial Schema Migration
// Creates all collections for the application
//
// In PocketBase JS migrations, use the `app` parameter from migrate(),
// NOT the `$app` global (which is only available in JSVM hooks).

migrate((app) => {
  // ── Users (Auth Collection) ──────────────────────────────────────────────
  // PocketBase may auto-create a "users" collection on first run.
  // We check if it exists and update it with our custom fields.
  let users
  try {
    users = app.findCollectionByNameOrId("users")
  } catch {
    users = new Collection({
      type: "auth",
      name: "users",
      listRule: "id = @request.auth.id",
      viewRule: "id = @request.auth.id",
      createRule: "",
      updateRule: "id = @request.auth.id",
      deleteRule: "",
      passwordAuth: { enabled: true, identityFields: ["email"] },
      fields: [
        { name: "name", type: "text", required: true, max: 100, presentable: true },
      ],
    })
    app.save(users)
  }

  // ── Bible Notes ──────────────────────────────────────────────────────────
  const bibleNotes = new Collection({
    type: "base",
    name: "bible_notes",
    listRule: "@request.auth.id != '' && user_id = @request.auth.id",
    viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
    deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
    fields: [
      {
        name: "user_id",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: users.id,
        cascadeDelete: true,
      },
      {
        name: "date",
        type: "date",
        required: true,
      },
      {
        name: "verse_refs",
        type: "json",
        required: true,
        maxSize: 5000,
      },
      {
        name: "content",
        type: "text",
        required: true,
        max: 50000,
      },
      {
        name: "created_at",
        type: "autodate",
        onCreate: true,
        onUpdate: false,
      },
      {
        name: "updated_at",
        type: "autodate",
        onCreate: true,
        onUpdate: true,
      },
    ],
    indexes: [
      "CREATE INDEX idx_bible_notes_user ON bible_notes (user_id)",
      "CREATE INDEX idx_bible_notes_date ON bible_notes (date)",
    ],
  })
  app.save(bibleNotes)

  // ── Small Group Notes ────────────────────────────────────────────────────
  const smallGroupNotes = new Collection({
    type: "base",
    name: "small_group_notes",
    listRule: "@request.auth.id != '' && user_id = @request.auth.id",
    viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
    deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
    fields: [
      {
        name: "user_id",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: users.id,
        cascadeDelete: true,
      },
      {
        name: "date",
        type: "date",
        required: true,
      },
      {
        name: "topic",
        type: "text",
        required: true,
        max: 200,
      },
      {
        name: "attendees",
        type: "text",
        max: 1000,
      },
      {
        name: "content",
        type: "text",
        required: true,
        max: 50000,
      },
      {
        name: "created_at",
        type: "autodate",
        onCreate: true,
        onUpdate: false,
      },
      {
        name: "updated_at",
        type: "autodate",
        onCreate: true,
        onUpdate: true,
      },
    ],
    indexes: [
      "CREATE INDEX idx_small_group_notes_user ON small_group_notes (user_id)",
      "CREATE INDEX idx_small_group_notes_date ON small_group_notes (date)",
    ],
  })
  app.save(smallGroupNotes)

  // ── Sermons ──────────────────────────────────────────────────────────────
  const sermons = new Collection({
    type: "base",
    name: "sermons",
    listRule: "@request.auth.id != '' && user_id = @request.auth.id",
    viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
    deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
    fields: [
      {
        name: "user_id",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: users.id,
        cascadeDelete: true,
      },
      {
        name: "date",
        type: "date",
        required: true,
      },
      {
        name: "title",
        type: "text",
        required: true,
        max: 300,
      },
      {
        name: "pastor",
        type: "text",
        required: true,
        max: 200,
      },
      {
        name: "campus",
        type: "text",
        required: true,
        max: 200,
      },
      {
        name: "service_type",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["morning", "evening", "special"],
      },
      {
        name: "content",
        type: "text",
        required: true,
        max: 50000,
      },
      {
        name: "created_at",
        type: "autodate",
        onCreate: true,
        onUpdate: false,
      },
      {
        name: "updated_at",
        type: "autodate",
        onCreate: true,
        onUpdate: true,
      },
    ],
    indexes: [
      "CREATE INDEX idx_sermons_user ON sermons (user_id)",
      "CREATE INDEX idx_sermons_date ON sermons (date)",
      "CREATE INDEX idx_sermons_campus ON sermons (campus)",
    ],
  })
  app.save(sermons)

  // ── Reading Plans ────────────────────────────────────────────────────────
  const readingPlans = new Collection({
    type: "base",
    name: "reading_plans",
    listRule: "@request.auth.id != '' && user_id = @request.auth.id",
    viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
    deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
    fields: [
      {
        name: "user_id",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: users.id,
        cascadeDelete: true,
      },
      {
        name: "name",
        type: "text",
        required: true,
        max: 200,
      },
      {
        name: "total_days",
        type: "number",
        required: true,
        min: 1,
      },
      {
        name: "start_date",
        type: "date",
        required: true,
      },
      {
        name: "plan_data",
        type: "json",
        required: true,
        maxSize: 100000,
      },
      {
        name: "created_at",
        type: "autodate",
        onCreate: true,
        onUpdate: false,
      },
      {
        name: "updated_at",
        type: "autodate",
        onCreate: true,
        onUpdate: true,
      },
    ],
    indexes: [
      "CREATE INDEX idx_reading_plans_user ON reading_plans (user_id)",
    ],
  })
  app.save(readingPlans)

  // ── Reading Plan Progress ────────────────────────────────────────────────
  const readingPlanProgress = new Collection({
    type: "base",
    name: "reading_plan_progress",
    listRule: "@request.auth.id != '' && user_id = @request.auth.id",
    viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
    deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
    fields: [
      {
        name: "plan_id",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: readingPlans.id,
        cascadeDelete: true,
      },
      {
        name: "user_id",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: users.id,
        cascadeDelete: true,
      },
      {
        name: "day_number",
        type: "number",
        required: true,
        min: 1,
      },
      {
        name: "completed",
        type: "bool",
        required: true,
      },
      {
        name: "completed_at",
        type: "date",
      },
      {
        name: "created_at",
        type: "autodate",
        onCreate: true,
        onUpdate: false,
      },
      {
        name: "updated_at",
        type: "autodate",
        onCreate: true,
        onUpdate: true,
      },
    ],
    indexes: [
      "CREATE INDEX idx_reading_progress_plan ON reading_plan_progress (plan_id)",
      "CREATE INDEX idx_reading_progress_user ON reading_plan_progress (user_id)",
      "CREATE UNIQUE INDEX idx_reading_progress_plan_day ON reading_plan_progress (plan_id, day_number)",
    ],
  })
  app.save(readingPlanProgress)

  // ── Revelations ──────────────────────────────────────────────────────────
  const revelations = new Collection({
    type: "base",
    name: "revelations",
    listRule: "@request.auth.id != '' && user_id = @request.auth.id",
    viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
    deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
    fields: [
      {
        name: "user_id",
        type: "relation",
        required: true,
        maxSelect: 1,
        collectionId: users.id,
        cascadeDelete: true,
      },
      {
        name: "date",
        type: "date",
        required: true,
      },
      {
        name: "content",
        type: "text",
        required: true,
        max: 50000,
      },
      {
        name: "created_at",
        type: "autodate",
        onCreate: true,
        onUpdate: false,
      },
      {
        name: "updated_at",
        type: "autodate",
        onCreate: true,
        onUpdate: true,
      },
    ],
    indexes: [
      "CREATE INDEX idx_revelations_user ON revelations (user_id)",
      "CREATE INDEX idx_revelations_date ON revelations (date)",
    ],
  })
  app.save(revelations)
}, (app) => {
  // Down: delete in reverse dependency order
  const collections = [
    "revelations",
    "reading_plan_progress",
    "reading_plans",
    "sermons",
    "small_group_notes",
    "bible_notes",
  ]

  for (const name of collections) {
    try {
      const collection = app.findCollectionByNameOrId(name)
      app.delete(collection)
    } catch {
      // Collection doesn't exist, skip
    }
  }

  // Note: We don't delete the "users" collection in down migration
  // as it may have been pre-existing
})

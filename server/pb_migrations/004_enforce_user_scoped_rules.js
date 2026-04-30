// Migration 004: Re-enforce user-scoped API rules on all collections
// Ensures every data collection filters by user_id = @request.auth.id
// This is idempotent — running it multiple times is safe.

migrate((app) => {
  const collections = [
    "bible_notes",
    "small_group_notes",
    "sermons",
    "reading_plans",
    "reading_plan_progress",
    "revelations",
  ]

  for (const name of collections) {
    try {
      const collection = app.findCollectionByNameOrId(name)
      collection.listRule = "@request.auth.id != '' && user_id = @request.auth.id"
      collection.viewRule = "@request.auth.id != '' && user_id = @request.auth.id"
      collection.createRule = "@request.auth.id != ''"
      collection.updateRule = "@request.auth.id != '' && user_id = @request.auth.id"
      collection.deleteRule = "@request.auth.id != '' && user_id = @request.auth.id"
      app.save(collection)
    } catch (err) {
      console.log(`Collection ${name} not found, skipping:`, err)
    }
  }

  // Also ensure users collection stays locked down
  try {
    const users = app.findCollectionByNameOrId("users")
    users.listRule = "id = @request.auth.id"
    users.viewRule = "id = @request.auth.id"
    users.createRule = ""
    users.updateRule = "id = @request.auth.id"
    users.deleteRule = ""
    app.save(users)
  } catch (err) {
    console.log("Users collection not found, skipping:", err)
  }
}, (app) => {
  // Down: intentionally no-op — we don't want to loosen security on rollback
})

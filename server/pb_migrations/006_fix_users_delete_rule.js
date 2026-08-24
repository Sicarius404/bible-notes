// Migration 006: Restrict users deleteRule to the record owner.
//
// Migrations 003/004 set users.deleteRule = "" (empty string). Per the
// PocketBase docs an empty rule means ANYONE can perform the action,
// including unauthenticated guests — i.e. anyone who knows a user's record
// id could delete that account. This migration restores the safe,
// owner-only rule (which is also PocketBase's default for the users
// collection). createRule stays "" (empty = public signup is allowed,
// which the app relies on).

migrate((app) => {
  const collection = app.findCollectionByNameOrId("users")

  collection.deleteRule = "id = @request.auth.id"

  app.save(collection)
}, (app) => {
  // Down: intentionally a no-op — we don't want to loosen security on rollback.
  // (Same convention as migration 004.)
})

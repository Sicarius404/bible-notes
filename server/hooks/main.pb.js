// PocketBase JS hooks — auto-populate user_id on record creation
// This ensures user_id is always set from the authenticated user,
// preventing clients from spoofing the field.
//
// Uses onRecordCreateRequest (v0.37.x API) which has access to e.auth
// for the authenticated user making the API request.

const USER_SCOPED_COLLECTIONS = [
    "bible_notes",
    "small_group_notes",
    "sermons",
    "reading_plans",
    "reading_plan_progress",
    "revelations",
]

for (const collectionName of USER_SCOPED_COLLECTIONS) {
    onRecordCreateRequest(function(e) {
        if (e.auth) {
            e.record.set("user_id", e.auth.id)
        }
        e.next()
    }, collectionName)

    onRecordUpdateRequest(function(e) {
        // Prevent user_id from being changed on update
        e.record.set("user_id", e.record.get("user_id"))
        e.next()
    }, collectionName)
}
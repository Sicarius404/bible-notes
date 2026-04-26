// PocketBase JS hooks — auto-populate user_id on record creation
// This ensures user_id is always set from the authenticated user,
// preventing clients from spoofing the field.
//
// Uses onRecordCreateRequest (v0.37.x API) which has access to e.auth
// for the authenticated user making the API request.

onRecordCreateRequest(function(e) {
    if (e.auth) {
        e.record.set("user_id", e.auth.id)
    }
    e.next()
}, "bible_notes")

onRecordCreateRequest(function(e) {
    if (e.auth) {
        e.record.set("user_id", e.auth.id)
    }
    e.next()
}, "small_group_notes")

onRecordCreateRequest(function(e) {
    if (e.auth) {
        e.record.set("user_id", e.auth.id)
    }
    e.next()
}, "sermons")

onRecordCreateRequest(function(e) {
    if (e.auth) {
        e.record.set("user_id", e.auth.id)
    }
    e.next()
}, "reading_plans")

onRecordCreateRequest(function(e) {
    if (e.auth) {
        e.record.set("user_id", e.auth.id)
    }
    e.next()
}, "reading_plan_progress")

onRecordCreateRequest(function(e) {
    if (e.auth) {
        e.record.set("user_id", e.auth.id)
    }
    e.next()
}, "revelations")
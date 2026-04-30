# server/pb_migrations/

## Responsibility
PocketBase schema migrations — defines the database collections, fields, indexes, and access rules. Migrations are applied automatically in filename order on server startup. Each file contains an `up` function (apply) and a `down` function (revert).

## Files

### 001_init_collections.js
The initial schema — creates the `users` auth collection and 6 base collections.

**Collections created:**

| Collection | Type | Purpose |
|---|---|---|
| `users` | Auth | User accounts. Fields: `name` (text). Auth via email/password. |
| `bible_notes` | Base | Personal bible study notes. Fields: `user_id` (relation→users), `date`, `verse_refs` (json), `content` (text, 50k max). |
| `small_group_notes` | Base | Small group meeting notes. Fields: `user_id` (relation→users), `date`, `topic`, `attendees` (text), `content` (text, 50k max). |
| `sermons` | Base | Sermon notes/records. Fields: `user_id` (relation→users), `date`, `title`, `pastor`, `campus`, `service_type` (select: morning/evening/special), `content` (text, 50k max). |
| `reading_plans` | Base | Bible reading plans. Fields: `user_id` (relation→users), `name`, `total_days` (number), `start_date`, `plan_data` (json, 100k max). |
| `reading_plan_progress` | Base | Per-day progress tracking for reading plans. Fields: `plan_id` (relation→reading_plans), `user_id` (relation→users), `day_number` (number), `completed` (bool), `completed_at` (date). |
| `revelations` | Base | Personal spiritual revelations/insights. Fields: `user_id` (relation→users), `date`, `content` (text, 50k max). |

**Access rule pattern** (applied to all base collections):
- `listRule`, `viewRule`, `updateRule`, `deleteRule`: `@request.auth.id != '' && user_id = @request.auth.id`
- `createRule`: `@request.auth.id != ''`
- All `user_id` fields are required, relation to `users`, with `cascadeDelete: true`.

**Indexes created:**
- `bible_notes`: user_id, date
- `small_group_notes`: user_id, date
- `sermons`: user_id, date, campus
- `reading_plans`: user_id
- `reading_plan_progress`: plan_id, user_id, unique(plan_id, day_number)
- `revelations`: user_id, date

**Down migration**: Deletes all 6 base collections (in reverse dependency order), preserves `users`.

### 002_add_special_service_type.js
Modifies the `sermons` collection's `service_type` select field.

**Up**: Updates the select values to `["morning", "evening", "special"]` — adds "special" as a third service type option.

**Down**: Reverts select values to `["morning", "evening"]` — removes the "special" option.

### 003_fix_users_create_rule.js
Fixes access rules on the `users` auth collection.

**Problem**: If PocketBase auto-creates the `users` collection, `createRule` and `deleteRule` may be `null` (unset) instead of explicit empty strings `""`. `null` means "nobody" (including superuser) rather than "anybody with a valid auth token."

**Up**: Sets `createRule = ""` and `deleteRule = ""` (empty string = superuser only in PocketBase's rule semantics).

**Down**: Reverts to `null` for `createRule` and `deleteRule`.

## Integration
- **Application order**: Files are applied in numeric prefix order (001, 002, 003) via `pocketbase serve --migrationsDir=/pb_migrations`.
- **In Docker**: `Dockerfile.pocketbase` copies `./pb_migrations` to `/pb_migrations` in the image.
- **Relations**: The `users` collection ID is captured at migration time and referenced by all base collections' `user_id` relation fields.
- **Hooks**: `server/hooks/main.pb.js` provides runtime enforcement of `user_id` (beyond what collection rules can guarantee).
- **Seed data**: The `reading_plans` collection schema (specifically `plan_data` json field) is designed to hold the reading plan data from `server/seed/reading-plans/`.

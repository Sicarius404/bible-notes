# server/seed/

## Responsibility
Seed data assets for the bible-notes application. Contains pre-built content that can be loaded into PocketBase collections at setup time — currently focused on Bible reading plans.

## Files
- **reading-plans/** — Subdirectory containing JSON files with structured daily Bible reading schedules. Each file is a complete reading plan with metadata (name, total days) and per-day passage assignments.

## Subdirectories
- **reading-plans/** — 4 reading plan presets: full-Bible plans at 90, 180, and 365 days, plus a New Testament-only plan at 30 days.

## Design
The seed data is designed to be loaded into the `reading_plans` collection's `plan_data` JSON field. Each plan is a self-contained JSON file with a consistent structure:
- `name` — Human-readable plan title
- `total_days` — Integer duration in days
- `days` — Array of day objects, each with `day` number and `passages` array

## Integration
- **Collection schema**: The `reading_plans` collection (defined in `001_init_collections.js`) has a `plan_data` JSON field with 100KB max size, designed to hold these seed files.
- **Loading**: Seed data is loaded by the application (not by migrations). The frontend or a setup script reads these JSON files and creates records in the `reading_plans` collection.
- **Usage**: When a user starts a reading plan, the frontend creates a `reading_plans` record with the seed plan's data, then tracks progress in `reading_plan_progress` records.

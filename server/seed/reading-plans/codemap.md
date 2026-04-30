# server/seed/reading-plans/

## Responsibility
Pre-built Bible reading plan presets for the bible-notes app. Users select a plan, which gets loaded into the `reading_plans` collection, and then track their daily progress via `reading_plan_progress`.

## Files

### bible-in-90-days.json
A fast-paced plan reading the entire Bible in 90 days (≈2 hours/day). 90 days, each day covering ~12 chapters. Covers OT in 70 days, NT in 20 days. Aggressively compresses Psalms across 11 days and Proverbs into 3 days.

### bible-in-180-days.json
A moderate pace reading the entire Bible in 180 days (≈1 hour/day). 180 days, each day covering ~6 chapters. A more relaxed pace than the 90-day plan, with dedicated days for each Wisdom book (Psalms spread over 21 days, Proverbs over 5 days).

### bible-in-365-days.json
A comfortable pace reading the entire Bible in one year. 365 days, each day covering ~3-4 chapters. The most granular plan with the smallest daily readings. Psalms are spread over 50 days, Proverbs over 11 days, and each minor prophet gets dedicated days.

### nt-in-30-days.json
A New Testament sprint — the entire NT in 30 days. 30 days, each day covering 5-9 chapters. Starts with the Gospels, then Acts, Paul's epistles, General epistles, and Revelation. Approximately 1-2 hours per day of reading.

## Data Structure (common to all files)

```json
{
  "name": "Plan Name",
  "total_days": <integer>,
  "days": [
    {
      "day": <integer>,
      "passages": ["Book ChapterStart-ChapterEnd", ...]
    }
  ]
}
```

- `name` — Display name shown in the UI
- `total_days` — Total duration of the plan
- `days[].day` — 1-indexed day number
- `days[].passages` — Array of passage strings (e.g. `"Genesis 1-7"`). Multiple entries in one day means multiple readings for that day.

## Integration
- The `plan_data` JSON field in the `reading_plans` collection stores the full contents of a selected plan file.
- Each plan's `name` and `total_days` map directly to the `name` and `total_days` fields of the `reading_plans` collection.
- When a user selects a plan, the app creates a `reading_plans` record with this JSON as `plan_data`, and generates `reading_plan_progress` records for each day.

# apps/web/src/lib/

## Responsibility
Utility functions and helpers shared across the web application.

## Design
- **Single utility**: Currently contains just the `cn()` helper — a common pattern in shadcn/ui projects for conditionally merging Tailwind CSS classes.
- **Extensible**: More utilities can be added here as the app grows (date formatting helpers, PocketBase helpers, etc.).

## Files
- `utils.ts` — Exports `cn(...inputs: ClassValue[])` which combines `clsx` for conditional class names and `tailwind-merge` for intelligent conflict resolution of Tailwind classes. This enables patterns like `cn("px-4 py-2", isActive && "bg-primary")` without class conflicts.

## Integration
- **Depends on**: `clsx` (conditional class joining), `tailwind-merge` (Tailwind class conflict resolution)
- **Consumed by**: Components and pages throughout the app for conditional styling

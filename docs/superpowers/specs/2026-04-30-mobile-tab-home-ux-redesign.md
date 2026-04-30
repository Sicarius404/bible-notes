# Mobile Tab Bar & Home Screen UX Redesign

**Date:** 2026-04-30
**Project:** bible-notes (Project ID: 2)
**Scope:** Mobile app only (`apps/mobile`)

---

## Summary

Four targeted UX improvements to the mobile app's bottom tab bar and Home screen:

1. Replace the visible **"Plans"** tab with **"uGroup"** (small groups).
2. Raise bottom tab bar icons so they sit comfortably above the iOS/Android swipe-up gesture area.
3. Remove the **"Welcome back, {name}"** greeting and tighten top spacing on the Home screen.
4. Change the **Revelations** tab icon from an `Eye` to a `Church` building.

---

## Motivation

- **Plans → uGroup:** Small groups are a higher-priority feature for users than reading plans; the tab bar should reflect that.
- **Gesture clearance:** Icons currently sit too low, making them feel cramped against the system home gesture.
- **Greeting removal:** The "Welcome back" text creates unnecessary vertical dead space; users want immediate access to content.
- **Revelation icon:** An eye icon is abstract; a church building is more contextually appropriate for the domain.

---

## Detailed Design

### 1. Bottom Tab Bar (`apps/mobile/app/(tabs)/_layout.tsx`)

#### 1.1 Tab Swap: Plans ↔ uGroup

| Tab | Current State | New State |
|-----|--------------|-----------|
| `reading-plans` | Visible as **"Plans"** | Hidden (`href: null`) |
| `small-groups` | Hidden (`href: null`) as **"Groups"** | Visible as **"uGroup"** |

- Update `title` and `headerTitle` of the `small-groups` tab to `"uGroup"`.
- Update `tabBarIcon` for `small-groups` from `BookOpen` to `Users` (avoids icon collision with Notes).
- Add `href: null` to the `reading-plans` tab definition.

#### 1.2 Raise Icons Above Gesture Area

Replace hardcoded `paddingBottom` and `height` with safe-area-aware values using `useSafeAreaInsets` from `react-native-safe-area-context`.

```ts
tabBarStyle: {
  backgroundColor: colors.surface,
  borderTopColor: colors.borderLight,
  borderTopWidth: 1,
  paddingTop: 10,
  paddingBottom: insets.bottom + 10,
  height: 56 + insets.bottom + 10,
  ...shadows.lg,
}
```

This adapts automatically to notched devices, landscape rotation, and future device sizes.

#### 1.3 Accessibility Fix

Change inactive tab label color from `colors.textMuted` (`#a3a3a3`, ~2.9:1 contrast) to `colors.textSecondary` (`#525252`, ~6.2:1 contrast) to meet WCAG AA for small text.

#### 1.4 Revelation Icon

- Import `Church` from `lucide-react-native`.
- Replace `Eye` with `Church` in the `revelations` tab `tabBarIcon`.

---

### 2. Home Screen (`apps/mobile/app/(tabs)/index.tsx`)

#### 2.1 Remove Greeting & Tighten Spacing

- **Delete** the entire `<View style={styles.greetingBlock}>…</View>` block and the `greetingBlock` / `greeting` styles.
- **Remove** `paddingTop` from the `scrollContent` style so content starts immediately below the safe-area header.
- **Reduce** `quickActions` bottom margin from `spacing.xl` (32px) to `spacing.lg` (24px) for tighter vertical rhythm.

#### 2.2 Add "See all" Link to Reading Plans

The Reading Plans section on Home currently has no action. Since Plans is now hidden from the tab bar, add a `See all →` action to the `SectionHeader` that navigates to `/reading-plans` using `router.push('/reading-plans')`.

#### 2.3 Revelation Quick-Action Icon

Change the quick-action button icon from `Eye` to `Church` for visual consistency with the updated tab bar.

---

## Files Changed

| File | Lines Changed | What |
|------|--------------|------|
| `apps/mobile/app/(tabs)/_layout.tsx` | ~25 | Tab swap, safe-area padding, icon imports, inactive color |
| `apps/mobile/app/(tabs)/index.tsx` | ~30 | Remove greeting, tighten spacing, add "See all", swap quick-action icon |

## Out of Scope

- Web app navigation (`apps/web`) — no changes.
- Shared constants (`packages/shared/src/constants.ts`) — no changes; these are used by the web app.
- Reading Plans screen functionality — remains fully functional; just hidden from the tab bar.

## Testing Notes

1. Verify tab bar shows: Home, Notes, Sermons, uGroup, Revelations (5 tabs).
2. Verify Plans tab is hidden but reachable via Home "See all" and deep links.
3. Test on physical iOS device (or simulator with home indicator) to confirm icons sit above the swipe-up zone.
4. Test on Android gesture-navigation device.
5. Verify `Church` icon renders clearly at 24px.
6. Check inactive tab label contrast passes WCAG AA.

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Reading Plans becomes undiscoverable | Added "See all" link on Home screen |
| uGroup icon collides with Notes icon | Switched uGroup to `Users` |
| Tab bar may clip on very small devices | Safe-area-aware height adapts automatically |
| Loss of personal warmth from greeting | Quick actions now feel like immediate hero content; tone shifts to utility hub |

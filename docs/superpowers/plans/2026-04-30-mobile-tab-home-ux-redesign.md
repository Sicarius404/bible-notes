# Mobile Tab Bar & Home Screen UX Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Swap the mobile bottom tab bar's visible "Plans" tab for "uGroup", raise icons above the gesture area, remove the Home greeting, and change the Revelations icon to a church.

**Architecture:** Two-file edit on the Expo Router mobile app. Tab configuration lives in `_layout.tsx`; Home screen content lives in `index.tsx`. Both use `lucide-react-native` icons and shared theme tokens.

**Tech Stack:** Expo SDK ~54, React Native, Expo Router, lucide-react-native, react-native-safe-area-context

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `apps/mobile/app/(tabs)/_layout.tsx` | Modify | Bottom tab bar: tab visibility, labels, icons, safe-area padding, inactive color |
| `apps/mobile/app/(tabs)/index.tsx` | Modify | Home screen: remove greeting, tighten spacing, add Reading Plans "See all", swap Revelation quick-action icon |

---

### Task 1: Update Bottom Tab Bar (`_layout.tsx`)

**Files:**
- Modify: `apps/mobile/app/(tabs)/_layout.tsx`

- [ ] **Step 1: Add `useSafeAreaInsets` import and update lucide imports**

Replace the existing import block at the top of the file:

```tsx
import { Tabs } from 'expo-router'
import { useAuth } from '../../components/auth-provider'
import { TouchableOpacity, Text, StyleSheet, Platform, View } from 'react-native'
import { router } from 'expo-router'
import { Home, BookOpen, Mic, CalendarDays, Eye, Settings, LogOut } from 'lucide-react-native'
import { colors, typography, shadows, radius } from '../../theme'
```

With:

```tsx
import { Tabs } from 'expo-router'
import { useAuth } from '../../components/auth-provider'
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Home, BookOpen, Mic, CalendarDays, Church, Settings, LogOut, Users } from 'lucide-react-native'
import { colors, typography, shadows } from '../../theme'
```

Changes:
- Remove unused `Platform` import
- Remove unused `radius` import
- Add `useSafeAreaInsets` import
- Add `Church` and `Users` icons
- Remove `Eye` icon

- [ ] **Step 2: Add safe area insets hook inside component**

After the existing line:
```tsx
  const { logout, user } = useAuth()
```

Add:
```tsx
  const insets = useSafeAreaInsets()
```

- [ ] **Step 3: Update tab bar style to use safe-area insets**

Replace the `tabBarStyle` block inside `screenOptions`:

```tsx
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          height: Platform.OS === 'ios' ? 88 : 64,
          ...shadows.lg,
        },
```

With:

```tsx
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          paddingTop: 10,
          paddingBottom: insets.bottom + 10,
          height: 56 + insets.bottom + 10,
          ...shadows.lg,
        },
```

- [ ] **Step 4: Change inactive tab text color for accessibility**

Replace:
```tsx
        tabBarInactiveTintColor: colors.textMuted,
```

With:
```tsx
        tabBarInactiveTintColor: colors.textSecondary,
```

- [ ] **Step 5: Hide "Plans" tab by adding `href: null`**

In the `reading-plans` tab definition, add `href: null` after the `tabBarIcon` line:

```tsx
      <Tabs.Screen
        name="reading-plans"
        options={{
          title: 'Plans',
          headerTitle: 'Reading Plans',
          tabBarIcon: ({ color, size }) => <CalendarDays size={size || 24} color={color} />,
          href: null,
        }}
      />
```

- [ ] **Step 6: Show "uGroup" tab — update label, icon, and remove `href: null`**

Replace the `small-groups` tab definition:

```tsx
      <Tabs.Screen
        name="small-groups"
        options={{
          title: 'Groups',
          headerTitle: 'Small Groups',
          tabBarIcon: ({ color, size }) => <BookOpen size={size || 24} color={color} />,
          href: null,
        }}
      />
```

With:

```tsx
      <Tabs.Screen
        name="small-groups"
        options={{
          title: 'uGroup',
          headerTitle: 'uGroup',
          tabBarIcon: ({ color, size }) => <Users size={size || 24} color={color} />,
        }}
      />
```

- [ ] **Step 7: Change Revelations tab icon from `Eye` to `Church`**

Replace:
```tsx
      <Tabs.Screen
        name="revelations"
        options={{
          title: 'Revelations',
          tabBarIcon: ({ color, size }) => <Eye size={size || 24} color={color} />,
        }}
      />
```

With:
```tsx
      <Tabs.Screen
        name="revelations"
        options={{
          title: 'Revelations',
          tabBarIcon: ({ color, size }) => <Church size={size || 24} color={color} />,
        }}
      />
```

- [ ] **Step 8: Verify `_layout.tsx` compiles**

Run: `cd /home/ziel/development/ai_testing/bible-notes/apps/mobile && npx tsc --noEmit`

Expected: No errors.

- [ ] **Step 9: Commit tab bar changes**

```bash
git add apps/mobile/app/(tabs)/_layout.tsx
git commit -m "feat(mobile): swap Plans for uGroup in tab bar, add safe-area padding, change Revelation icon"
```

---

### Task 2: Update Home Screen (`index.tsx`)

**Files:**
- Modify: `apps/mobile/app/(tabs)/index.tsx`

- [ ] **Step 1: Remove `useAuth` import and unused `Eye` icon, add `Church`**

Replace the existing import block at the top:

```tsx
import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { listBibleNotes, listSermons, listRevelations, listReadingPlans } from '@bible-notes/pocketbase-client'
import type { BibleNote, Sermon, Revelation, ReadingPlan } from '@bible-notes/shared'
import { router } from 'expo-router'
import { useAuth } from '../../components/auth-provider'
import { Card, CardTitle, CardSubtitle, Screen, SectionHeader, EmptyState } from '../../components/ui'
import { colors, spacing, typography, shadows, radius } from '../../theme'
import { BookOpen, Mic, Eye, FileText, CalendarDays } from 'lucide-react-native'
```

With:

```tsx
import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { listBibleNotes, listSermons, listRevelations, listReadingPlans } from '@bible-notes/pocketbase-client'
import type { BibleNote, Sermon, Revelation, ReadingPlan } from '@bible-notes/shared'
import { router } from 'expo-router'
import { Card, CardTitle, CardSubtitle, Screen, SectionHeader, EmptyState } from '../../components/ui'
import { colors, spacing, typography, shadows, radius } from '../../theme'
import { BookOpen, Mic, Church, FileText, CalendarDays } from 'lucide-react-native'
```

Changes:
- Remove `useAuth` import
- Replace `Eye` with `Church` in lucide import

- [ ] **Step 2: Remove `user` from component body**

Replace:
```tsx
  const { user } = useAuth()
```

With: (delete the line entirely)

The component body should now start with:
```tsx
  const [notes, setNotes] = useState<BibleNote[]>([])
```

- [ ] **Step 3: Remove greeting block from JSX**

Delete these lines from the JSX:

```tsx
        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>Welcome back, {user?.name?.split(' ')[0] || 'Friend'}</Text>
        </View>
```

- [ ] **Step 4: Swap Revelation quick-action icon from `Eye` to `Church`**

In the quick actions section, find:
```tsx
            <View style={styles.quickIconWrapper}>
              <Eye size={22} color={colors.success} />
            </View>
```

Replace with:
```tsx
            <View style={styles.quickIconWrapper}>
              <Church size={22} color={colors.success} />
            </View>
```

- [ ] **Step 5: Add "See all" action to Reading Plans SectionHeader**

Find:
```tsx
            <SectionHeader title="Reading Plans" />
```

Replace with:
```tsx
            <SectionHeader
              title="Reading Plans"
              action={
                <TouchableOpacity onPress={() => router.push('/reading-plans')}>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              }
            />
```

- [ ] **Step 6: Remove top padding from scroll content**

Replace:
```tsx
  scrollContent: {
    paddingTop: spacing.md,
  },
```

With:
```tsx
  scrollContent: {
    paddingTop: 0,
  },
```

- [ ] **Step 7: Tighten quick actions bottom margin**

Replace:
```tsx
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
```

With:
```tsx
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
```

- [ ] **Step 8: Remove unused greeting styles**

Delete these two style definitions entirely:

```tsx
  greetingBlock: {
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.heading2,
    color: colors.text,
  },
```

- [ ] **Step 9: Verify `index.tsx` compiles**

Run: `cd /home/ziel/development/ai_testing/bible-notes/apps/mobile && npx tsc --noEmit`

Expected: No errors.

- [ ] **Step 10: Commit home screen changes**

```bash
git add apps/mobile/app/(tabs)/index.tsx
git commit -m "feat(mobile): remove Home greeting, tighten spacing, add Reading Plans see-all, swap Revelation icon"
```

---

## Verification Checklist

After both tasks are complete, verify:

- [ ] Tab bar shows 5 visible tabs: Home, Notes, Sermons, uGroup, Revelations
- [ ] Plans tab is hidden but reachable via Home "See all" link and direct navigation
- [ ] uGroup tab uses `Users` icon (not `BookOpen`)
- [ ] Revelations tab uses `Church` icon (not `Eye`)
- [ ] Tab bar icons sit visibly above the bottom gesture area on iOS and Android
- [ ] Home screen has no "Welcome back" greeting
- [ ] Home screen content starts immediately below the header with minimal gap
- [ ] Reading Plans section on Home has a working "See all" link
- [ ] Revelation quick-action button on Home uses `Church` icon
- [ ] Inactive tab labels use `#525252` (darker than before)
- [ ] TypeScript compiles with zero errors

## Self-Review

**Spec coverage:**
- ✅ Tab swap (Plans hidden, uGroup visible) → Task 1, Steps 5–6
- ✅ Safe-area-aware tab bar padding → Task 1, Steps 1–3
- ✅ Accessibility fix for inactive tab color → Task 1, Step 4
- ✅ Revelation icon → Task 1, Step 7 + Task 2, Step 4
- ✅ Remove greeting → Task 2, Steps 1–3
- ✅ Tighten Home spacing → Task 2, Steps 6–7
- ✅ Add "See all" to Reading Plans → Task 2, Step 5

**Placeholder scan:** No TBDs, TODOs, or vague instructions. Every step includes exact code.

**Type consistency:** All icons (`Users`, `Church`) are from `lucide-react-native`. `useSafeAreaInsets` is from `react-native-safe-area-context` v5.6.0 (already in package.json). `SectionHeader` already accepts `action?: React.ReactNode` per its type definition.

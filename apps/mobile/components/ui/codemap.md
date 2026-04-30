# apps/mobile/components/ui/

## Responsibility

Reusable UI component library built on top of the app's design tokens (`theme.ts`). Provides consistent styling primitives for all screens: buttons, cards, inputs, and layout containers.

## Files

- **index.ts** — Barrel export file, re-exports all UI components:
  - `Button`, `Card`, `CardTitle`, `CardSubtitle`, `CardMeta`, `CardFooter`, `Input`, `Screen`, `SectionHeader`, `EmptyState`
- **Button.tsx** — Pressable button component with variants and states:
  - `variant`: `'primary'` | `'secondary'` | `'outline'` | `'ghost'`
  - `size`: `'sm'` | `'md'` | `'lg'`
  - `disabled` / `loading` states (shows `ActivityIndicator` when loading)
  - Optional `icon` slot rendered inline with text
  - Styled with theme: primary/accent background or transparent, border radius `lg`, shadow on non-ghost variants
- **Card.tsx** — Tappable card container with sub-components:
  - `Card` — Container with optional `onPress` (wraps in `TouchableOpacity` when provided), `variant` (`default` | `highlight` | `subtle`), with shadow on non-subtle variants
  - `CardTitle` — Heading text (theme `heading4`)
  - `CardSubtitle` — Secondary text (theme `bodySmall`, muted color)
  - `CardMeta` — Small uppercase caption text
  - `CardFooter` — Bottom section with top border separator
- **Input.tsx** — Text input field with label and error support:
  - Props: `value`, `onChangeText`, `placeholder`, `label`, `error`, `multiline`, `numberOfLines`, `keyboardType`, `autoCapitalize`, `secureTextEntry`
  - Styled with theme: surface highlight background, md border radius, light border, error state shows red border + error text
  - Multiline mode adapts `textAlignVertical` and min height (120px)
- **Screen.tsx** — Page layout primitives:
  - `Screen` — Safe area wrapper with background color and horizontal padding; accepts optional `style` override
  - `SectionHeader` — Section title with optional action element (used for "See all" links on home screen)
  - `EmptyState` — Centered empty state display with icon placeholder, title, and optional subtitle (used in FlatList `ListEmptyComponent`)

## Integration

- **Depends on:** `../../theme` for all design tokens (colors, spacing, radius, typography, shadows), React Native core components (`View`, `Text`, `TextInput`, `TouchableOpacity`, `StyleSheet`, `ActivityIndicator`), `react-native-safe-area-context` (for `SafeAreaView` in `Screen`).
- **Consumed by:** Every screen in `app/` — tab screens, detail screens, create/edit forms, auth screens. Components are fundamental to the app's visual consistency.
- **Design choices:** Components use the `children` pattern for flexibility (Card, SectionHeader) and accept `style` overrides. The theme's `typography` presets are spread into text styles rather than using conditional logic. Input uses `surfaceHighlight` background with `borderLight` border for a subtle elevation effect.

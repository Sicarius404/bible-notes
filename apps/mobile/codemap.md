# apps/mobile/

## Responsibility

The Expo React Native mobile app for Bible Notes — a cross-platform (iOS/Android/Web) spiritual journaling application. This is the mobile counterpart to the Next.js web frontend (`apps/web`), sharing the same PocketBase backend and `@bible-notes/shared` types.

## Files

- **package.json** — Declares the `@bible-notes/mobile` package with Expo 54, React Native 0.81, Expo Router 6, and workspace dependencies on `@bible-notes/pocketbase-client` and `@bible-notes/shared`.
- **app.json** — Expo configuration: app name "Bible Notes", scheme `biblenotes`, portrait orientation, iOS/Android bundle IDs `co.za.zonit.biblenotes`, Expo Router plugin enabled, static web output via Metro.
- **metro.config.js** — Metro bundler config for monorepo: watches workspace root, resolves `node_modules` from both `apps/mobile` and workspace root, and maps `@bible-notes/*` workspace packages as `extraNodeModules`.
- **theme.ts** — Design tokens: colors (primary navy `#1e3a5f`, accent gold `#d4a853`, warm background `#f8f7f4`), spacing scale (`xs` 4px to `xxl` 48px), border radius values, typography presets (heading1–heading4, body, caption, button), and shadow definitions (sm/md/lg).
- **tsconfig.json** — Extends `expo/tsconfig.base`, strict mode, path alias `@/*` mapped to `./*`.
- **.env** — Environment variable `EXPO_PUBLIC_POCKETBASE_URL` pointing to production at `https://bible.zonit.co.za`.
- **.npmrc** — Sets `node-linker=hoisted` for pnpm compatibility with Expo.
- **assets/** — App icon, adaptive icon, favicon, splash image, and SVG sources.

## Integration

- **Depends on:** `@bible-notes/pocketbase-client` for all PocketBase CRUD operations and auth; `@bible-notes/shared` for TypeScript types (`BibleNote`, `Sermon`, `Revelation`, `ReadingPlan`, `SmallGroupNote`, `ServiceType`) and shared constants (`SERVICE_TYPE_LABELS`, `SERVICE_TYPES`).
- **Consumed by:** No direct consumers (it's a leaf app). Deployed via Coolify/Traefik alongside `apps/web` and PocketBase backend.
- **PocketBase URL** is configured at build/startup time via `EXPO_PUBLIC_POCKETBASE_URL` env var.

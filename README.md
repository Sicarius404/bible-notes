# Bible Notes

Bible Notes is a pnpm monorepo for the Bible study web and mobile apps, with a PocketBase backend.

## Repository layout

```text
apps/
  web/       Next.js web app
  mobile/    Expo / React Native app
packages/
  shared/            Shared types, validation, dates, HTML, and verse parsing
  pocketbase-client/ Shared PocketBase API and authentication client
server/
  hooks/             PocketBase JavaScript hooks
  pb_migrations/     PocketBase schema migrations
  seed/              Seed data
scripts/             Backup, restore, and setup helpers
nginx/               Local reverse-proxy and TLS configuration
```

The web app keeps route files in `src/app/` and groups reusable code by responsibility:

```text
apps/web/src/components/
  content/       Rich-text editor and content renderers
  forms/         Reusable data-entry controls
  integrations/  External service integrations
  navigation/   Navigation, filtering, and theme controls
  providers/    React context and app providers
  ui/           Presentational UI primitives
  verse/        Scripture reference components
```

## Common commands

```bash
pnpm install
pnpm dev:web
pnpm dev:mobile
pnpm type-check
pnpm lint
pnpm build
```

Copy `.env.example` to the appropriate local environment file before starting the apps.

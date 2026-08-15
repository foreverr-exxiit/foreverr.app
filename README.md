# ǝterrn (Eterrn) — lifecycle memorial & celebration platform

Formerly **Foreverr**, by **EXXiiT**. A social platform that captures a
person's whole arc — birth and milestones, weddings and pets, through to
memorialization — with tributes, gifts, AI-assisted writing, a creator
economy, and proactive remembrance reminders.

> Repo folder: `Foreverr-app` · Bundle id: `com.exxit.eterrn`
> Live web: https://foreverr-app.vercel.app · Repo:
> https://github.com/foreverr-exxiit/foreverr.app

## Monorepo layout

| Path | What it is |
|------|-----------|
| `apps/mobile/` | Expo (SDK 52) / React Native app — ~180 screens, the product |
| `apps/admin/` | Admin dashboard (single-file HTML) |
| `apps/og-share/` | Standalone Vercel Edge service for rich share-link previews |
| `packages/core/` | Hooks, stores, services, Supabase client & types |
| `packages/ui/` | Shared UI components |
| `packages/config/` | Theme, env, feature flags |
| `supabase/` | Migrations (`migrations/`) + Edge Functions (`functions/`) |
| `docs/` | Session notes / working docs (tracked) |
| `project-docs/` | Planning PDFs, brand source, legacy archive — **git-ignored**, see its README |

## Stack

Expo Router · TypeScript · Supabase (Auth/DB/Storage/Edge/Realtime) ·
NativeWind v4 · Zustand · TanStack Query v5 · RevenueCat (IAP) ·
Stripe (donations) · Sentry · pnpm + turbo monorepo.

## Common commands

```bash
pnpm install                              # bootstrap (node-linker=hoisted)
pnpm --filter @foreverr/core test         # run unit tests (vitest)
cd apps/mobile && npx tsc --noEmit | grep -v "supabase/functions"   # typecheck app
cd apps/mobile && npx expo export --platform web --clear            # build web
cd apps/mobile && npx vercel --prod --yes                           # deploy web
```

Supabase migrations run via the SQL editor; the latest few
(`00051`–`00053`) still need deploying. See `docs/` and
`supabase/DEPLOY_MIGRATIONS.md`.

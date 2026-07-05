# eterrn OG share microservice

A single Vercel Edge function that renders rich link previews for shared
memorial pages (`/s/:id`). Deliberately isolated from the pnpm monorepo:
its `package.json` has **no dependencies**, so Vercel's `npm install` is a
trivial no-op. The main app project (`apps/mobile`) can't host this
function because its `package.json` uses `workspace:*` deps that npm
cannot parse during a function build.

## What it does

`/s/:id` (id = memorial UUID or slug):
1. Looks up the memorial via Supabase REST (public anon key; memorials
   are public-read).
2. Returns HTML with per-memorial Open Graph + Twitter tags — the
   honoree's photo (`og:image`), "Remembering {name}" title, and
   "{born} – {died}".
3. Redirects a human visitor to the app at `/lifecycle/:id`.

No image generation: `og:image` is the memorial's own hosted photo,
which every crawler renders reliably.

## Deploy (separate Vercel project)

```bash
cd apps/og-share
npx vercel --prod --yes    # first run links/creates the project
```

Note the production URL it prints (e.g. `https://eterrn-og-share.vercel.app`).

## Wire it to the main site

The main app rewrites `/s/:id` to this service so shared links stay on
one branded domain. In `apps/mobile/vercel.json`:

```json
{ "source": "/s/:id", "destination": "https://<og-service-url>/s/:id" }
```

Share URLs in the app already point at `foreverr-app.vercel.app/s/:id`
(see `packages/core/src/hooks/useSharing.ts`), so the proxy makes them
resolve to this service transparently.

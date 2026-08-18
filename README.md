# sh1v.com

Personal site — Next.js 16, Tailwind v4, Motion. Dark monochrome with a single red accent.

Three pieces of live data: a GitHub contribution tracker, a genuine rolling 7-day Spotify
top-tracks/artists window, and a Now page.

```
pnpm install
pnpm dev          # http://localhost:3000
pnpm lint         # Biome (lint + format)
pnpm typecheck    # tsc --noEmit
pnpm test         # Vitest
pnpm build
pnpm photos       # regenerate src/data/photos.ts after changing public/photos
pnpm spotify:auth # one-time: mint a Spotify refresh token into .env.local
pnpm env:push     # sync .env.local to Vercel (production by default)
```

## Architecture

| Path | Role |
|---|---|
| `src/components/motion/transitions.ts` | The **only** place easing, duration, and stagger are defined |
| `src/lib/{github,spotify,redis,mdx,env}.ts` | One module per external service; routes stay thin |
| `src/data/experience.ts` | Single source for work history — feeds timeline, ⌘K palette, OG images |
| `src/styles/globals.css` | `@theme` tokens; no raw hex values live anywhere else |

`/` and `/now` are **Partial Prerender**: a static shell with request-time data islands
(`await connection()` inside the Suspense boundary). GitHub and Spotify failures degrade to a
fallback rather than taking the page down.

### Motion
One entrance (`<Reveal>`), one list primitive (`<Stagger>` + `<StaggerItem>`), one curve
(`cubic-bezier(0.16, 1, 0.3, 1)`). `useReducedMotion()` is checked inside the primitives, so
`prefers-reduced-motion` is honoured everywhere without per-component work. The site defines a
single `@keyframes` rule (the marquee).

### Red
Red is an event, not a theme — at most one red element per viewport. It marks the heatmap's top
quartile, section indices, the ⌘K active row, focus rings, link sweeps, and `::selection`.
`#ff2d20` on `#050505` measures **5.48:1** (WCAG AA).

## Environment

Copy `.env.example`. Every variable is validated by `src/lib/env.ts` at first use, so a missing
one fails with a message naming it.

Fill in `.env.local`, then push it — values go to Vercel over stdin, so no secret
ever lands in your shell history or the process table:

```bash
cp .env.example .env.local   # then fill it in
pnpm env:push                # production
pnpm env:push preview        # preview

gh secret set CRON_SECRET    # the Actions cron needs only this
```

`UPSTASH_REDIS_REST_URL` / `_TOKEN` are injected by the Vercel Marketplace integration — do not
set them by hand. Use **different** `CRON_SECRET`s and **separate Upstash databases** for Preview
and Production, so preview deploys can never write into the production 7-day window.

## Spotify setup, once

1. Accept the Spotify Developer Terms at https://developer.spotify.com/dashboard.
2. **Create app** — any name. Set the redirect URI to exactly:
   ```
   http://127.0.0.1:8888/callback
   ```
   Spotify rejects `localhost`; a loopback IP literal is required. Check **Web API**.
3. Copy the Client ID and Client Secret into `.env.local`.
4. `pnpm spotify:auth` — opens the consent screen and writes `SPOTIFY_REFRESH_TOKEN`
   back into `.env.local` for you.
5. `pnpm env:push`.

> **Refresh tokens for this app expire after 180 days** (shown as "Refresh Token Lifetime"
> on the app's dashboard page). When one lapses, the sync fails with a message naming the
> fix, and the Now page's "synced Xm ago" visibly goes stale. Re-run steps 4–5 to recover.

## The Spotify 7-day window

Spotify has no 7-day range — `time_range` offers only `short_term` (~4 weeks), `medium_term`, and
`long_term`, and `/recently-played` is a rolling 50-item buffer. A real week has to be accumulated.

`.github/workflows/spotify-sync.yml` polls every 30 minutes and POSTs to
`/api/cron/spotify-sync`. Plays fold into per-day Redis sorted sets with an **8-day TTL**, so the
window prunes itself. A stored cursor makes re-runs idempotent — verified by tests in
`src/lib/spotify.test.ts`.

This is an Action rather than a Vercel Cron because **Vercel Hobby crons are capped at once per
day** and fail at deploy time on anything more frequent.

> ⚠️ GitHub disables scheduled workflows on public repos after **60 days without repository
> activity**. The Now page renders "synced Xm ago" so a stalled cron is visible rather than silent.
> Re-enable it from the Actions tab if it stops.

## Deploying

Continuous deployment is live. The Vercel project `shiv-website/shiv-website` is connected to this
repository with `main` as the production branch, so **every push to `main` builds and promotes to
production automatically** and every pull request gets a preview deployment. Nothing in CI deploys —
there is no Vercel token in GitHub, because the Git integration does not need one. The Actions
workflow runs lint, typecheck, tests, and a build purely as a gate.

Deployment protection is set to `all_except_custom_domains`: `*.vercel.app` URLs sit behind Vercel
SSO, and the site is public only on an attached custom domain. Until a domain is attached, nothing
is publicly reachable — that is deliberate, not a misconfiguration.

To attach the domain:

1. Add `sh1v.com` + `www.sh1v.com` in Vercel. Create the records Vercel shows in Cloudflare DNS as
   **DNS-only (grey cloud)** — proxying breaks Vercel's certificate issuance.
3. **`ratnani.org` MX records are Cloudflare Email Routing and must not be touched.** Replace only
   its A records with a proxied `AAAA 100::` placeholder, then add a Single Redirect rule:
   `http.host eq "ratnani.org"` → `concat("https://sh1v.com", http.request.uri.path)`, 301,
   preserve query. Same for `www`.
4. Verify `dig ratnani.org MX` is unchanged and send a real test email to `shiv@ratnani.org`.
5. Delete the old Cloudflare Pages project `ratnani-website`.
6. Downgrade the `ratnani.org` zone Pro → Free. Read the "you will lose" list first and confirm
   Email Routing is not on it. Redirect rules survive — Free allows 10.

## Writing

Posts live in `content/writing/*.mdx` with `title`, `description`, `date`, `draft` frontmatter.
`draft: true` posts are reachable by direct URL but never listed and never in the sitemap.

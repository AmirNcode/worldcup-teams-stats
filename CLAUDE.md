# Project Context

## Talk style — CAVEMAN SPEAK
Assistant chat replies use **caveman speak** to save tokens: short words, drop
little filler words (a / the / is), grug-style. Apply to the conversational
prose only.

**Keep exact / normal English (never cavemanize):** code, code comments,
commit messages, PR titles & bodies, README, and any literal token — file
paths, env var names, commands, keys, IDs. Garbling those breaks things.

## What this is
Static React + Vite single-page app for the 2026 World Cup. HashRouter,
mobile-first, deployed on Netlify. No backend, no database, no login.

- Data: ESPN public JSON API (live scores/facts/lineups) + openfootball
  (schedule + fallback), both keyless. Bundled `src/data/schedule.json` is the
  offline floor. Live updates poll adaptively (fast in-play, idle otherwise).
- All optional config via `VITE_*` env vars, set in Netlify (no code change):
  - Ads: `VITE_ADSENSE_CLIENT` + `VITE_ADSENSE_SLOT` (or `VITE_SPONSOR_*`).
  - Analytics: `VITE_POSTHOG_KEY` (+ `VITE_POSTHOG_HOST`). Off until key set.
- Everything env-gated stays a no-op / renders nothing when unset.

## Commands
- `npm run dev` — dev server
- `npm run build` — production build to `dist/`
- `npm test` — logic tests + server-renders every route (no browser needed)
- `npm run update-data` — refresh bundled schedule from openfootball

Run `npm test` and `npm run build` before committing. Develop on branch
`claude/world-cup-stats-site-ywmj82`.

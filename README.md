# 🏆 World Cup 2026 — Teams & Stats

A mobile-first web app for the 2026 FIFA World Cup (USA · Canada · Mexico, 48 teams):
live group standings, deep team stats, a schedule in **your** time zone, knockout
bracket, Golden Boot race and head-to-head comparisons.

No accounts, no API keys, no backend — a static React app you can host anywhere.

## Features

- **📊 Group leaderboard** — all 12 group tables with points, wins/draws/losses,
  goals for/against and goal difference, recomputed automatically from results.
  Green = top-2 (qualify), amber = 3rd place (8 best 3rds also advance).
  A **3rd-place race** table ranks all 12 third-placed teams, and a **Today**
  section surfaces the day's matches at the top of the home page.
- **🔎 Team search & stats** — search all 48 teams; each team page shows its 2026
  results with goalscorers, group position, every past World Cup appearance and
  result, titles, all-time top scorer, an icon of the team, and fun facts.
- **👕 Lineups** — each team page shows the starting XI from its most recent
  match, grouped by position (GK / DEF / MID / FWD) with shirt numbers and a
  rounded "C" badge on the captain, plus a Reserves subsection for the named
  substitutes. Pulled live from ESPN, falling back to the latest available
  lineup if the newest match hasn't published one yet.
- **📅 Schedule in your time zone** — kickoff times render in the visitor's local
  time zone automatically (a fan in Toronto sees Eastern time). Includes a
  **weekly calendar view** with day-by-day match chips plus a full list view.
- **🏟️ Knockout bracket** — Round of 32 through the Final; slots fill in as
  earlier rounds finish.
- **👟 Golden Boot tracker** — tournament top scorers (own goals excluded,
  penalties tracked), plus total goals and goals-per-match.
- **⚖️ Head-to-head compare** — pick any two teams and compare pedigree and
  2026 form side by side.
- **★ Favorite team & 🌙 dark mode** — star a team to pin it on the home page
  and highlight its fixtures; theme follows your system and can be toggled.
  Both saved on your device.
- **📱 Add to Home Screen** — web app manifest + icons, so installing from the
  browser menu gives a full-screen app with its own icon (no service worker,
  so no stale-cache surprises).

## Score updates & match facts

Scores are updated at **half-time and full-time** (no minute-by-minute live
feed, by design): during the first half a match shows "1st half", at the
break the half-time score appears, during the second half the HT score stays
up (labelled), and the final score lands at full-time. Tapping the middle of
any started match card opens a **match facts** sheet — goals with minutes,
possession, shots, corners, cards, attendance, venue and referee — fetched
on demand. Tapping a team name still goes to that team's stats page.

Two keyless public sources are layered, fetched client-side on load and every
5 minutes while open:

1. **ESPN's public JSON API** (`site.api.espn.com`, CORS-enabled) — primary
   source for live scores, status, scorers and the match-facts stats.
2. **[openfootball](https://github.com/openfootball/worldcup.json)** — slower
   to update but community-curated; provides the schedule and acts as the
   fallback score source.

Both merge over a bundled copy of the schedule and are cached in
`localStorage`, so the site always renders even if both feeds are
unreachable. If ESPN ever changes its (unofficial) API shape, parsing fails
soft and the site simply behaves as openfootball-only.

## Running locally

```bash
npm install
npm run dev      # dev server
npm run build    # production build -> dist/
npm run preview  # serve the production build
npm test         # logic tests + renders every route (no browser needed)
```

## Deploying

`npm run build` produces a fully static `dist/` folder (relative asset paths,
hash-based routing) that works on GitHub Pages, Netlify, Vercel, Cloudflare
Pages, or any static file host with zero configuration.

## Refreshing the bundled data

```bash
npm run update-data   # regenerates src/data/schedule.json from openfootball
```

Useful occasionally during the tournament so first paint (before the live
fetch lands) is as fresh as possible. The live fetch keeps users current
regardless.

## Monetization (single ad / sponsor slot)

There's one responsive, non-intrusive ad slot at the bottom of each page
(above the tab bar), rendered by `src/components/AdSlot.jsx`. It has three
modes, chosen automatically from build-time env vars:

1. **Google AdSense** — when `VITE_ADSENSE_CLIENT` and `VITE_ADSENSE_SLOT`
   are set, it serves a responsive display unit and the build emits a matching
   `ads.txt` at the site root automatically. A fresh ad is requested on each
   in-app navigation (the AdSense-approved single-page-app pattern).
2. **Direct sponsor banner** — if AdSense isn't set but `VITE_SPONSOR_IMAGE`
   and `VITE_SPONSOR_URL` are, it shows a linked banner image instead. Good
   for selling the slot to one sponsor without touching code.
3. **Nothing** — with neither configured, production renders no slot at all
   (so users never see an empty box); `npm run dev` shows a labelled
   placeholder so you can see where it sits.

Config lives in env vars (see `.env.example`). Nothing here is secret —
AdSense IDs are public — but the recommended path is to set them in your host
(e.g. Netlify → Site settings → Environment variables) so going live needs no
code change, just a redeploy. There's no database, login, or payment code.

## Data sources & accuracy

- **Live scores, scorers, match stats:** ESPN public JSON API (no key
  required, CORS-friendly; unofficial, parsed defensively).
- **Schedule + fallback scores:** [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json)
  (public domain, no key required, CORS-friendly).
- **Historical team data** (`src/data/teams.json`): curated from Wikipedia /
  FIFA records through the 2022 World Cup. Spot a mistake? It's one JSON file —
  PRs welcome.

## Stack

React 18 + Vite + react-router (hash routing). No UI framework — one
hand-written stylesheet, mobile-first with a bottom tab bar and automatic
dark mode.

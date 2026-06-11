# 🏆 World Cup 2026 — Teams & Stats

A mobile-first web app for the 2026 FIFA World Cup (USA · Canada · Mexico, 48 teams):
live group standings, deep team stats, a schedule in **your** time zone, knockout
bracket, Golden Boot race and head-to-head comparisons.

No accounts, no API keys, no backend — a static React app you can host anywhere.

## Features

- **📊 Group leaderboard** — all 12 group tables with points, wins/draws/losses,
  goals for/against and goal difference, recomputed automatically from results.
  Green = top-2 (qualify), amber = 3rd place (8 best 3rds also advance).
- **🔎 Team search & stats** — search all 48 teams; each team page shows its 2026
  results with goalscorers, group position, every past World Cup appearance and
  result, titles, all-time top scorer, an icon of the team, and fun facts.
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

## Score updates

Scores are updated at **half-time and full-time** (no minute-by-minute live
feed, by design). The app fetches the public
[openfootball](https://github.com/openfootball/worldcup.json) dataset on load
and every 5 minutes while open, and merges it over a bundled copy of the
schedule — so the site always renders even if the feed is unreachable (the
last good fetch is also cached in `localStorage`).

## Running locally

```bash
npm install
npm run dev      # dev server
npm run build    # production build -> dist/
npm run preview  # serve the production build
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

## Data sources & accuracy

- **Schedule, scores, scorers:** [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json)
  (public domain, no key required, CORS-friendly).
- **Historical team data** (`src/data/teams.json`): curated from Wikipedia /
  FIFA records through the 2022 World Cup. Spot a mistake? It's one JSON file —
  PRs welcome.

## Stack

React 18 + Vite + react-router (hash routing). No UI framework — one
hand-written stylesheet, mobile-first with a bottom tab bar and automatic
dark mode.

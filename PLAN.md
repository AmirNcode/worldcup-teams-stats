# PLAN.md — Current initiative: League Soccer (top-5 European leagues)

This file is the **blueprint for the work in progress**. Once a phase ships,
durable facts move into `CLAUDE.md`; `TASKS.md` tracks the phase checklist.
Full design rationale and confirmed user decisions:
`docs/superpowers/specs/2026-07-06-league-soccer-design.md`.

> Planning docs at a glance:
> - **PLAN.md** (this file) — blueprint for the current initiative.
> - **TASKS.md** — phased checklist for the current initiative.
> - **CLAUDE.md** — permanent memory: everything done, decisions, rules, tools,
>   design guides. Updated as new information lands.

---

## 1. Goal

Add one new **Leagues** section hosting the five major European leagues —
Premier League, La Liga, Serie A, Bundesliga, Ligue 1 — with a standings table
and a fixtures/results window per league. Leagues are pure config in a registry;
one parameterized set of pages serves all five.

Confirmed decisions (from the spec):
- One `⚽ Leagues` sport-switcher entry, not five; chip-row league picker inside.
- v1 scope: table + fixtures window. No team pages / scorers / live polling.
- Data: ESPN unofficial keyless API (`eng.1`, `esp.1`, `ita.1`, `ger.1`, `fra.1`),
  verified live for all five leagues.
- Season: whatever ESPN reports as current (2025-26 final tables now, rolls to
  2026-27 automatically).

## 2. Architecture (mirrors `src/f1/`)

```
src/leagues/
  lib/leagues.js      # LEAGUES registry (id, espn, name, country, flag) + leagueById
  lib/espn.js         # pure parsers: parseStandings, parseScoreboard
  lib/data.jsx        # LeaguesDataProvider: snapshot → localStorage → lazy live fetch
  data/snapshot.json  # bundled offline floor, all five leagues (generated)
  components/LeaguePicker.jsx
  pages/LeagueTablePage.jsx      # /leagues/:league
  pages/LeagueFixturesPage.jsx   # /leagues/:league/fixtures
scripts/generate-leagues.mjs     # npm run update-leagues-data
```

- **Routes:** `/leagues` → redirect `/leagues/epl`; unknown slug → same redirect.
- **Tabs:** 📊 Table, 📅 Fixtures. `SECTIONS` tab `to` values are static, so
  `App.jsx` substitutes the active `:league` slug into the two tab links when the
  leagues section is active (small contained special case).
- **Endpoints:** standings `apis/v2/sports/soccer/<code>/standings`; scoreboard
  `apis/site/v2/sports/soccer/<code>/scoreboard?dates=<past-21d>-<today+21d>&limit=100`
  fetched as two windows (past / future).
- **Provider:** model `{ [leagueId]: { standings, matches, fetchedAt } }`; a
  league fetches lazily on first view; refresh on focus + 6h tick for the viewed
  league only; cache key `leagues.espn.v1`; fail-soft everywhere.
- **Theming:** `[data-section='leagues']` pitch-green accent
  (`#0a7d33` light / `#34c265` dark).
- **Analytics:** `track('league_viewed', { league })`; `normalizeRoute` collapses
  `/leagues/<x>` → `/leagues/:league`.

## 3. Testing

- Unit checks for `parseStandings` / `parseScoreboard` (happy path, missing
  fields, empty payload never throws) in `tests/suite.test.jsx`.
- SSR smoke routes: `/leagues`, `/leagues/epl`, `/leagues/laliga/fixtures`,
  `/leagues/nope`.
- `npm test` + `npm run build` green before every commit; browser verification
  via the dev preview before finishing.

## 4. Out of scope (v1)

Team detail pages, top scorers, in-play live updates, historical seasons, cups,
per-league accents, last-viewed-league persistence.

## 5. Rollout

All work on `development`, local commits only — **no push until the user says**
(push to `main` triggers the Netlify production deploy).

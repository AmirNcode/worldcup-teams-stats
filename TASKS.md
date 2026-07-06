# TASKS.md — Current initiative: League Soccer section

Phased checklist for the work described in `PLAN.md` (spec:
`docs/superpowers/specs/2026-07-06-league-soccer-design.md`). Check items off
as they land. TDD: parser/logic items get failing checks in
`tests/suite.test.jsx` first.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done

---

## Phase 0 — Docs
- [x] `PLAN.md` — repoint at the leagues initiative
- [x] `TASKS.md` — this checklist

## Phase 1 — Data layer (pure, testable)
- [x] `src/leagues/lib/leagues.js` — `LEAGUES` registry + `leagueById()` + `DEFAULT_LEAGUE`
- [x] Failing checks: `parseLeagueStandings` (rank/W/D/L/GF/GA/GD/Pts/note), `parseLeagueScoreboard`
      (pre/post state, scores, kickoff ISO), empty payloads never throw
- [x] `src/leagues/lib/espn.js` — `standingsUrl`, `scoreboardUrl`, `parseLeagueStandings`,
      `parseLeagueScoreboard` + `fetchLeagueStandings` (previous-season fallback) +
      `fetchLeagueMatches` (widened windows, capped, deduped)
- [x] `scripts/generate-leagues.mjs` + `update-leagues-data` npm script
- [x] `src/leagues/data/snapshot.json` — generated, all five leagues (2025-26 finals)

## Phase 2 — Provider
- [x] `src/leagues/lib/data.jsx` — `LeaguesDataProvider` + `useLeagueData(leagueId)`:
      snapshot → localStorage (`leagues.espn.v1`) → lazy live fetch; focus + 6h refresh
      for viewed league; fail-soft
- [x] Mount provider in `src/main.jsx`

## Phase 3 — Shell wiring
- [x] `src/lib/sections.js` — `leagues` section entry (⚽, home `/leagues`, Table/Fixtures tabs)
- [x] `App.jsx` — routes (`/leagues` redirect, `:league` pages, unknown slug redirect),
      league-slug substitution in tab links, `LeaguesUpdatedChip`
- [x] `src/leagues/components/LeaguePicker.jsx` — chip row, active league highlighted
- [x] `styles.css` — `[data-section='leagues']` green accent, picker + table styles
- [x] `src/lib/analytics.js` — `normalizeRoute` collapses `/leagues/<x>`

## Phase 4 — Pages
- [x] `LeagueTablePage.jsx` — standings table, zone coloring via `note`, season label
- [x] `LeagueFixturesPage.jsx` — Results (newest first) + Upcoming (local time),
      summer-break empty state

## Phase 5 — Tests & verification
- [x] SSR smoke routes: `/leagues`, `/leagues/epl`, `/leagues/laliga`, `/leagues/bundesliga/fixtures`, `/leagues/nope`
- [x] `npm test` green, `npm run build` green
- [x] Browser verification: tables + fixtures render live (EPL/Bundesliga spot-checked,
      snapshot carries all five), tabs follow active league, no console errors

## Phase 6 — Memory
- [x] `CLAUDE.md` — document the leagues section (§21), repo layout, scripts

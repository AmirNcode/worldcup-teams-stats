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

## Phase 7 — Club pages (round 2)
- [x] Parsers + fetch helper (TDD): `parseTeams`, `parseRoster`, `parseTeamSchedule`,
      `fetchTeamBundle` (results fall back a season during the summer flip)
- [x] Snapshot: teams list per league (`update-leagues-data`); **/teams endpoint has no
      CORS headers → generator-only, browser carries the bundled list forward**
- [x] Provider: `useLeagueTeams` via model entry + `useLeagueTeam(league, teamId)` lazy
      in-memory team bundles (roster + fixtures + results)
- [x] `LeagueTeamsPage` — searchable club list (🔎 Teams tab, third tab)
- [x] `LeagueTeamPage` — header + season stats, next match first, upcoming, previous
      matches collapsed (score/date/venue), squad grouped GK/DEF/MID/FWD with coach,
      curated honours & fun facts (`src/leagues/data/clubs.js`)
- [x] Standings table team names link to club pages; `league_team_viewed` analytics;
      route normalization for team routes
- [x] Tests (11 new checks + 3 SSR routes) + build green; browser-verified (search,
      squad, collapse toggle, live refresh after CORS fix)

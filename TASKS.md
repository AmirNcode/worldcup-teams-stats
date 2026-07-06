# TASKS.md — Current initiative: League Soccer section

Phased checklist for the work described in `PLAN.md` (spec:
`docs/superpowers/specs/2026-07-06-league-soccer-design.md`). Check items off
as they land. TDD: parser/logic items get failing checks in
`tests/suite.test.jsx` first.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done

---

## Phase 0 — Docs
- [ ] `PLAN.md` — repoint at the leagues initiative
- [ ] `TASKS.md` — this checklist

## Phase 1 — Data layer (pure, testable)
- [ ] `src/leagues/lib/leagues.js` — `LEAGUES` registry + `leagueById()` + `DEFAULT_LEAGUE`
- [ ] Failing checks: `parseStandings` (rank/W/D/L/GF/GA/GD/Pts/note), `parseScoreboard`
      (pre/post state, scores, kickoff ISO), empty payloads never throw
- [ ] `src/leagues/lib/espn.js` — `standingsUrl`, `scoreboardUrl`, `parseStandings`,
      `parseScoreboard` (defensive, ESPN league shapes)
- [ ] `scripts/generate-leagues.mjs` + `update-leagues-data` npm script
- [ ] `src/leagues/data/snapshot.json` — generated, all five leagues

## Phase 2 — Provider
- [ ] `src/leagues/lib/data.jsx` — `LeaguesDataProvider` + `useLeagueData(leagueId)`:
      snapshot → localStorage (`leagues.espn.v1`) → lazy live fetch; focus + 6h refresh
      for viewed league; fail-soft
- [ ] Mount provider in `src/main.jsx`

## Phase 3 — Shell wiring
- [ ] `src/lib/sections.js` — `leagues` section entry (⚽, home `/leagues`, Table/Fixtures tabs)
- [ ] `App.jsx` — routes (`/leagues` redirect, `:league` pages, unknown slug redirect),
      league-slug substitution in tab links, `LeaguesUpdatedChip`
- [ ] `src/leagues/components/LeaguePicker.jsx` — chip row, active league highlighted
- [ ] `styles.css` — `[data-section='leagues']` green accent, picker + table styles
- [ ] `src/lib/analytics.js` — `normalizeRoute` collapses `/leagues/<x>`

## Phase 4 — Pages
- [ ] `LeagueTablePage.jsx` — standings table, zone coloring via `note`, season label
- [ ] `LeagueFixturesPage.jsx` — Results (newest first) + Upcoming (local time),
      summer-break empty state

## Phase 5 — Tests & verification
- [ ] SSR smoke routes: `/leagues`, `/leagues/epl`, `/leagues/laliga/fixtures`, `/leagues/nope`
- [ ] `npm test` green, `npm run build` green
- [ ] Browser verification: table + fixtures render live for all five leagues; no console errors

## Phase 6 — Memory
- [ ] `CLAUDE.md` — document the leagues section (§20-style), repo layout, scripts

# League Soccer Section — Design

**Date:** 2026-07-06
**Status:** Proposed
**Scope:** Add the five major European leagues (Premier League, La Liga, Serie A, Bundesliga, Ligue 1) as one new "Leagues" section in the multi-sport shell.

## Decisions (confirmed with user)

- **Navigation:** one `⚽ Leagues` entry in the sport switcher (not five). A league picker inside the section switches leagues.
- **Scope (v1):** standings table + fixtures/results window per league. No team pages, no top scorers, no live-match polling (deferred).
- **Data source:** ESPN unofficial keyless API (same host already used for World Cup live scores). League codes: `eng.1`, `esp.1`, `ita.1`, `ger.1`, `fra.1`. All five verified live: standings return 20/20/20/18/18 teams; scoreboard returns results with `STATUS_FULL_TIME`.
- **Season:** whatever ESPN calls current — the completed 2025-26 season now, rolling to 2026-27 automatically when it starts.
- **Fixtures page:** recent + upcoming window (last ~2 matchweeks of results, next ~2 of fixtures), not the full season.

## Architecture — parameterized league engine

One set of pages driven by a `:league` route param. Leagues are pure config; adding a sixth league is one registry line. Structure mirrors `src/f1/` (registry + pure parsers + provider + snapshot floor):

```
src/leagues/
  lib/
    leagues.js      # LEAGUES registry + byId lookup (pure)
    espn.js         # pure parsers: parseStandings, parseScoreboard (ESPN league shapes)
    data.jsx        # LeaguesDataProvider: per-league snapshot → localStorage → live
  data/
    snapshot.json   # bundled offline floor, all five leagues (generated)
  components/
    LeaguePicker.jsx  # horizontal chip row, one chip per league, active highlighted
  pages/
    LeagueTablePage.jsx     # /leagues/:league        (section home content)
    LeagueFixturesPage.jsx  # /leagues/:league/fixtures
scripts/generate-leagues.mjs  # snapshot generator (npm run update-leagues-data)
```

### Registry (`src/leagues/lib/leagues.js`)

```js
export const LEAGUES = [
  { id: 'epl',        espn: 'eng.1', name: 'Premier League', country: 'England',  flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'laliga',     espn: 'esp.1', name: 'La Liga',        country: 'Spain',    flag: '🇪🇸' },
  { id: 'seriea',     espn: 'ita.1', name: 'Serie A',        country: 'Italy',    flag: '🇮🇹' },
  { id: 'bundesliga', espn: 'ger.1', name: 'Bundesliga',     country: 'Germany',  flag: '🇩🇪' },
  { id: 'ligue1',     espn: 'fra.1', name: 'Ligue 1',        country: 'France',   flag: '🇫🇷' },
]
```

`id` is the URL slug and object key everywhere. `espn` never leaks outside the data layer.

### Routes & navigation

- Sections registry gains: `{ id: 'leagues', sport: 'Leagues', emoji: '⚽', title: 'Top Leagues', home: '/leagues', tabs: [ {📊 Table → '/leagues/epl'}, {📅 Fixtures → '/leagues/epl/fixtures'} ] }`.
- `/leagues` redirects to `/leagues/epl` (EPL default; no persistence in v1).
- Routes: `/leagues/:league` (table), `/leagues/:league/fixtures`. Unknown `:league` slug → redirect to `/leagues/epl`.
- Tab bar limitation: `SECTIONS` tabs are static strings, but the active league lives in the URL. The tab links point at the *active* league, so the tabs for the leagues section are computed: `sectionForPath` stays as-is; `App.jsx` rewrites the two tab `to` values by substituting the current `:league` slug when the leagues section is active. Small, contained special case.
- `LeaguePicker` chip row renders below the top bar on both pages; tapping a chip navigates to the same page for that league.

### Data layer

**Endpoints (per league):**
- Standings: `site.api.espn.com/apis/v2/sports/soccer/<code>/standings`
- Scoreboard: `site.api.espn.com/apis/site/v2/sports/soccer/<code>/scoreboard?dates=YYYYMMDD-YYYYMMDD&limit=100` — two windows: past 21 days and next 21 days (covers ~2 matchweeks each side; during the summer break the results window is simply the last played matchweeks).

**Parsers (`src/leagues/lib/espn.js`, pure):**
- `parseStandings(json)` → `[{ rank, teamId, name, abbrev, logo, played, w, d, l, gf, ga, gd, pts, note }]` — `note` carries ESPN's rank annotation (Champions League / relegation) for zone coloring; `deductions` folded into pts as ESPN reports them.
- `parseScoreboard(json)` → `[{ id, date, home, away, homeScore, awayScore, state, matchday }]` where `state` ∈ `pre | in | post` from ESPN status. Defensive parsing throughout — bad payload returns `[]`, never throws (same policy as `src/lib/espn.js`).

**Provider (`src/leagues/lib/data.jsx`):**
- `LeaguesDataProvider` mounted globally (like `F1DataProvider`).
- Model shape: `{ [leagueId]: { standings, matches, fetchedAt } }`.
- Layering per league: bundled snapshot → localStorage cache (`leagues.espn.v1`) → live fetch.
- **Lazy per league:** a league is fetched the first time it is viewed, then cached; refresh on tab focus and a 6h interval for the currently viewed league only. No polling for leagues not on screen.
- Fail-soft: any fetch/parse failure keeps the previous state.
- `useLeagueData(leagueId)` → `{ standings, matches, updatedAt, source, refresh }`.

**Snapshot (`scripts/generate-leagues.mjs`):**
- Fetches standings + both scoreboard windows for all five leagues, writes `src/leagues/data/snapshot.json` `{ generatedAt, source: 'espn', leagues: { epl: {...}, ... } }`.
- `package.json` script: `update-leagues-data`. Uses the same pure parsers as the provider.

### Pages

**Table (`/leagues/:league`):** full standings table — rank, team (logo + name), P W D L GF GA GD Pts. Zone coloring via `note` (CL qualification / relegation) using existing CSS tokens (`--good-soft`, `--warn-soft`). Header row sticky within the card. Season label from the payload.

**Fixtures (`/leagues/:league/fixtures`):** matches grouped by local date (reuse `fmtDate`/`dayKey` from `src/lib/format.js`), completed matches show final score, upcoming show kickoff in visitor's local zone. Two groups: "Results" (newest first) and "Upcoming" (soonest first). Empty upcoming state during summer break: "Fixtures for 2026-27 appear when the season schedule is published."

### Theming & shell

- `[data-section='leagues']` accent block in `styles.css` (green `#0a7d33` light / `#34c265` dark — pitch green; trivially revertable like F1 red).
- Top-bar chip: `LeaguesUpdatedChip` (same pattern as `F1UpdatedChip`) showing the viewed league's `updatedAt`.
- `SportSwitcher` needs no change — it renders `SECTIONS` generically.

### Analytics

`track('league_viewed', { league })` on league switch; route normalization: `/leagues/<x>` → `/leagues/:league` in `normalizeRoute`.

### Testing

- Unit: `parseStandings` + `parseScoreboard` on captured ESPN fixtures (happy path, missing fields, empty payload never throws).
- SSR smoke: add `/leagues`, `/leagues/epl`, `/leagues/laliga/fixtures`, `/leagues/nope` to the route list.
- Existing suite + `npm run build` must stay green.

## Error handling summary

Every network path fail-soft (keep prior state); unknown league slug redirects to EPL; snapshot guarantees first paint; localStorage writes wrapped in try/catch (same as F1).

## Out of scope (v1)

Team detail pages, top scorers, live in-play polling, historical seasons, cup competitions, league-specific accents, last-viewed-league persistence.

## Rollout

Feature work on `development` per branch policy. No push until user says (Netlify deploy gate).

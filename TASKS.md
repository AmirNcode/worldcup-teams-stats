# TASKS.md — Current initiative: add the Formula 1 section

Phased checklist for the work described in `PLAN.md`. Check items off as they
land. When the initiative ships, archive the completed phases and repoint this
file at the next initiative.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done

---

## Phase 0 — Docs
- [x] `PLAN.md` — blueprint + future-sports architecture + data-source research
- [x] `TASKS.md` — this checklist
- [x] `CLAUDE.md` — add the multi-sport / sections section; update repo layout

## Phase 1 — Shared shell (multi-sport)
- [x] `src/lib/sections.js` — `SECTIONS` registry + `sectionForPath()`
- [x] `src/components/SportSwitcher.jsx` — dropdown title (caret, a11y, outside-click/Esc)
- [x] `App.jsx` — derive active section; render its title + tab bar; `data-section` on root
- [x] `App.jsx` — top-bar reflow: update chip on row 1, feedback + theme on row 2
- [x] `App.jsx` — register F1 routes; "Sample data" chip on F1 (mock phase)
- [x] `styles.css` — switcher/dropdown styles, two-row top-bar, `[data-section='f1']` red accent

## Phase 2 — F1 mock data (`src/f1/data/`)
- [x] `teams.js` — 10 constructors (color, base, power unit, titles, points, driver slugs, facts)
- [x] `drivers.js` — 20 drivers (number, country, team, points, wins, podiums, poles)
- [x] `circuits.js` — 12 circuits (country, length, laps, lap record, facts)
- [x] `calendar.js` — 12 rounds; first 6 "done" with finishing order + pole + fastest lap
- [x] `index.js` — lookups/derivations (`driverBySlug`, `driversByPoints`, `driverResults`, …)

## Phase 3 — F1 pages (`src/f1/pages/`)
- [x] `F1StandingsPage` — drivers' + constructors' tables
- [x] `F1CalendarPage` — round list, winner on done rounds, link to circuit
- [x] `F1TeamsPage` + `F1TeamPage` — constructor browse + detail (with its drivers)
- [x] `F1DriversPage` + `F1DriverPage` — driver browse + detail (per-GP results, wins)
- [x] `F1CircuitsPage` + `F1CircuitPage` — circuit browse + detail (fastest-lap record)

## Phase 4 — Tests & verification
- [x] `tests/suite.test.jsx` — add F1 routes to SSR smoke; fix the `home-link` → switcher assertion
- [x] `npm test` green (38 checks pass)
- [x] `npm run build` clean (73 modules)

## Phase 5 — Ship
- [x] Commit on `development`
- [x] Push to `origin/development`
- [x] (User) reviewed F1 red accent in-app — kept

## Phase 6 — F1 refinements (round 2)
- [x] Standings: newcomer explainers under Drivers’ + Constructors’ Championship
- [x] Team logos: `F1TeamLogo` + `public/f1/logos/` convention + color-badge fallback
- [x] Tab reorder: Calendar first and section home (Standings → `/f1/standings`)
- [x] Calendar: per-round start time in the visitor’s local time zone
- [x] Tests updated (routes + assertions); `npm test` + `npm run build` green
- [x] Commit + push to `development`

## Phase 7 — Live data (next; see PLAN.md §4.1)
- [ ] Design pass: verify Jolpica + OpenF1 CORS from a static browser app; decide on a proxy if blocked
- [ ] Jolpica overlay: standings, schedule/calendar, results, drivers, constructors, circuits
- [ ] Mock data (`src/f1/data/*`) becomes the bundled offline floor
- [ ] OpenF1 live overlay: race-day positions/intervals on the current round
- [ ] `F1DataProvider` + adaptive polling; pure parse/merge logic in `src/f1/lib/` + tests
- [ ] `npm test` + `npm run build`; commit on `development`

---

## Future initiatives (backlog — see PLAN.md §1, §5)
- [ ] Next sport (tennis / a domestic soccer league) via the same section recipe

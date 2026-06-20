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

## Phase 7a — Live structured data (Jolpica) — DONE
- [x] CORS verified open on Jolpica + OpenF1 (no proxy / backend needed)
- [x] `src/f1/lib/jolpica.js` parsers + `normalize()` (+ unit tests)
- [x] `scripts/generate-f1.mjs` + `src/f1/data/snapshot.json` (offline floor; `npm run update-f1-data`)
- [x] `F1DataProvider` (`src/f1/lib/data.jsx`): snapshot → cache → live; 6h poll + focus refresh; fail-soft
- [x] `src/f1/lib/select.js` selectors + curated reference (constructors, circuits, flags by Jolpica id)
- [x] All 8 F1 pages read live data; route slugs are Jolpica ids; logos keyed by `constructorId`
- [x] Real F1 “Updated…” chip replaces the “Sample data” chip
- [x] `npm test` + `npm run build` green; verified live data renders; commit + push

## Phase 7b — Live race timing (OpenF1) — NEXT
- [ ] `src/f1/lib/openf1.js` parsers (sessions, positions, intervals, drivers) + tests
- [ ] Detect a live session; LIVE badge on the current round
- [ ] Race running-order view (positions / intervals) updating during a session
- [ ] Faster race-day polling in `F1DataProvider`; dormant otherwise
- [ ] `npm test` + `npm run build`; commit on `development`

---

## Future initiatives (backlog — see PLAN.md §1, §5)
- [ ] Next sport (tennis / a domestic soccer league) via the same section recipe

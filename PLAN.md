# PLAN.md — Multi-sport expansion (current work: Formula 1)

This file is the **blueprint for the work in progress**. It describes the target
design and the reasoning behind it. Once a phase ships, the durable facts move
into `CLAUDE.md` (the project memory); `TASKS.md` tracks the phase/task
checklist. When the current work is done, this file is updated for the next
sport.

> Planning docs at a glance:
> - **PLAN.md** (this file) — blueprint for the current initiative.
> - **TASKS.md** — phased checklist for the current initiative.
> - **CLAUDE.md** — permanent memory: everything done, decisions, rules, tools,
>   design guides. Updated as new information lands.

---

## 1. Vision

Grow the site from a single–event World Cup app into a **multi-sport stats
platform**. Each sport is a self-contained *section* with its own tabs, pages,
and data, mounted under one shared shell (top bar + tab bar + theme). The first
new section is **Formula 1**. Future candidates: tennis, domestic soccer
leagues (e.g. Premier League, La Liga), NBA, etc.

The design goal is that **adding a sport is additive**: drop in a section config
entry plus that sport's pages/data, and the shell, switcher, routing, and theming
pick it up with no rework of existing sports.

---

## 2. Shared shell architecture

### 2.1 Section registry (`src/lib/sections.js`)
A single ordered array, `SECTIONS`, is the source of truth for every sport:

```js
{
  id: 'f1',                 // stable id; also used as data-section for theming
  sport: 'Formula 1',       // human label shown in the switcher sub-line
  emoji: '🏁',
  title: 'Grand Prix 2026', // shown in the top bar
  home: '/f1',              // section landing route (soccer's is '/')
  tabs: [ { to, end?, emoji, label }, ... ], // exactly the bottom tab bar
}
```

`sectionForPath(pathname)` returns the active section by matching the URL prefix
(`pathname === home || pathname.startsWith(home + '/')`), falling back to the
first (default) section. **The URL is the single source of truth** for which
sport is active — no global state — so deep links and reloads preserve the sport,
which fits the existing `HashRouter` with no extra redirects.

### 2.2 Sport switcher (`src/components/SportSwitcher.jsx`)
The top-bar title becomes a dropdown button (replaces the old "title links home"
behavior). It lists every entry in `SECTIONS`; selecting one navigates to that
section's `home`. A `▾`/`▴` caret signals the dropdown; the active sport is
checked. Closes on select, outside-click, or Esc. Accessible: `aria-haspopup`,
`aria-expanded`, `menuitemradio`.

### 2.3 Top-bar layout
Decluttered into two rows on the right:
- Row 1: the live/update chip (soccer) or a "Sample data" chip (F1 while mocked).
- Row 2: feedback ✉️ and dark-mode 🌙 buttons.

### 2.4 Section-aware tab bar + title
`App` computes the active section once per render and renders that section's
`title` and `tabs`. The tab bar markup is data-driven from `tabs[]`.

### 2.5 Per-sport accent (theming)
`App` sets `data-section={section.id}` on the app root. `styles.css` overrides
`--accent` / `--accent-soft` per section, e.g. F1 → red (`#e10600`). Soccer keeps
the current blue. This is a few CSS lines and is trivially reversible (drop the
`[data-section='f1']` block) — F1 red is on probation pending a look in-app.

---

## 3. Formula 1 section (this initiative)

### 3.1 Tabs (bottom bar, left → right)
| Tab | Route | Emoji | Purpose |
|-----|-------|-------|---------|
| Calendar | `/f1` | 📅 | Season rounds with **local-time start**, circuit, country; completed rounds show the winner. **Section home** (selecting Grand Prix lands here). |
| Standings | `/f1/standings` | 🏆 | Drivers' + Constructors' championship tables (cumulative points), each with a newcomer explainer. |
| Teams | `/f1/teams` | 🏎️ | Browse constructors (with logos). → team page. |
| Drivers | `/f1/drivers` | 🧑‍✈️ | Browse drivers. → driver page. |
| Circuits | `/f1/circuits` | 🏟️ | Browse circuits. → circuit page. |

Non-tab (detail) routes: `/f1/team/:slug`, `/f1/driver/:slug`, `/f1/circuit/:slug`.

**Team logos:** rendered by `F1TeamLogo` from `public/f1/logos/<slug>.svg`, with a
color-badge fallback (team color + abbreviation) until a file is supplied. Logos
are user-supplied trademarks; none are committed to the repo.

**Why these five (vs. soccer's Groups/Schedule/Teams/Bracket/Boot):** F1 has no
knockout bracket and no single "top scorer" leaderboard, so:
- *Bracket* → **Circuits** (a track guide, with each circuit's fastest-lap record).
- *Boot* → folded away. The individual leaderboards fans want — **Wins, Podiums,
  Poles** — are surfaced inside the pages that give them context (per-driver on the
  Driver page, per-race fastest laps on the Circuit page) rather than as a
  redundant tab. **Standings already ranks drivers by points**, so a separate
  Results/Points tab would duplicate it.

### 3.2 Page responsibilities
- **Standings** — two tables: Drivers (pos, driver + team, points, wins) and
  Constructors (pos, team, points).
- **Calendar** — ordered round list; "done" rounds show the winner, upcoming show
  the date; a round links to its circuit.
- **Teams** → **Team page** — constructor info (base, power unit, titles, points,
  championship position) **plus its drivers**, each with their stats/facts, per
  the agreed model (the team page is where a constructor's drivers live).
- **Drivers** → **Driver page** — driver bio + season stats (points, wins,
  podiums, poles) + **per-GP results, most recent first** (this is the "Wins"
  surface: P1 finishes highlighted).
- **Circuits** → **Circuit page** — track facts (length, laps, country) +
  **fastest-lap record** (the "Fastest Laps" surface).

### 3.3 Data — sample mock now, real feeds later
First pass ships **representative sample/mock data** so every page looks alive.
It lives in plain modules under `src/f1/data/` and is clearly labelled as a
placeholder. Shapes are designed to map onto the real feeds (below) so wiring
them later is a clean swap, not a rewrite.

Data files: `teams.js`, `drivers.js`, `circuits.js`, `calendar.js`, with
`index.js` exposing lookups/derivations (`driverBySlug`, `driversByPoints`,
`driverResults`, …). Season aggregates are hard-coded in the mock; per-race
finishing order lives once in `calendar.js` and feeds the Driver pages, so the
mock stays internally consistent.

---

## 4. Data sources (researched; for the real-data phase)

| Source | Cost / Auth | Covers | Intended role |
|--------|-------------|--------|---------------|
| **Jolpica-F1** (`api.jolpi.ca`, drop-in Ergast successor) | Free, no key | Standings, schedule, results, drivers, constructors, circuits; 1950–present | **Primary** structured feed — maps ~1:1 to the tabs |
| **OpenF1** (`api.openf1.org`) | Free historical (2023+), no key; **live = paid OAuth** | Live timing, lap times, positions, telemetry, weather | **Live overlay** during sessions (mirrors soccer's ESPN layer) |
| **F1DB** (JSON/CSV/SQL dumps) | Free | Full historical DB | **Bundled offline floor** (mirrors `schedule.json`) |
| Ergast | **Dead** (shut down end-2024) | — | Do not use |
| Hyprace / api-sports / Sportradar | Paid | Various | Only if scaling needs it |

This mirrors the soccer stack's three layers exactly: **F1DB snapshot → Jolpica
overlay → OpenF1 live**. **To verify before wiring:** CORS from the static
browser app (OpenF1 is browser-friendly; Jolpica needs a check) and the OpenF1
free-tier rate limits (3 req/s, 30 req/min).

### 4.1 Decided v1 scope (live data)
Target chosen with the user: **real structured data (Jolpica) + a live race-day
timing overlay (OpenF1)** — the full mirror of the soccer side, built in two
steps. **CORS is open on both APIs** (`access-control-allow-origin: *`), so the
static browser app calls them directly — **no proxy / backend needed**.

**Phase 7a — Jolpica (DONE):** replaces the mock for standings, schedule/calendar,
results, drivers, constructors, circuits. `src/f1/data/snapshot.json` (generated by
`scripts/generate-f1.mjs`) is the bundled **offline floor**. `F1DataProvider`
(`src/f1/lib/data.jsx`) layers snapshot → localStorage cache → live fetch, with
pure parsers/selectors in `src/f1/lib/{jolpica,select}.js` (unit-tested). Curated
reference (team colors, circuit specs, flags) fills what Jolpica lacks, keyed by
Jolpica id; route slugs are Jolpica ids.

**Phase 7b — OpenF1 (DONE, scope revised):** true live timing turned out to be a
**paid** OpenF1 tier (€9.90/mo) that would also need a token-holding backend, so —
with the user — we pivoted to the **free historical** tier: a **race-detail page**
(`/f1/race/:round`, `F1RacePage`) that enriches a completed round with **pit stops
+ tyre strategy** on top of Jolpica's classification. Pure parsers in
`src/f1/lib/openf1.js`; joined to a round **by date**; fetched lazily and
**sequentially** (3 req/s free-tier limit); **fail-soft** to a Jolpica-only
classification. No live-during-session timing, no backend, no cost.

---

## 5. Recipe — add a future sport (tennis, a league, …)
1. Add an entry to `SECTIONS` in `src/lib/sections.js` (id, title, home, tabs).
2. Create `src/<sport>/pages/*` and `src/<sport>/data/*` (mock first if needed).
3. Register the routes in `App.jsx` under the section's `home` prefix.
4. Add a `[data-section='<id>']` accent block in `styles.css` (optional).
5. Add the new routes to the SSR smoke test in `tests/suite.test.jsx`.
6. `npm test` + `npm run build`; commit on `development`.

No change to other sports is required — the shell is data-driven from `SECTIONS`.

---

## 6. Out of scope (this initiative — YAGNI)
Real F1 data + live polling, an F1 data provider/context, an F1 "compare" tool,
telemetry/charts, favorites for drivers, and exhaustive full-grid accuracy. The
mock is representative, not authoritative.

# CLAUDE.md — World Cup 2026 Teams & Stats

Project guide for any AI coding assistant. This file is the single source of
truth: read it and you should understand the whole app and be able to extend,
debug, or rebuild it identically.

**Companion docs & memory policy:** `PLAN.md` is the blueprint for the current
initiative and `TASKS.md` its phased checklist. **This file (`CLAUDE.md`) is the
durable memory** — all work done, decisions, rules, policies, tools, and design
guides across every initiative; keep it updated as new information lands. The app
is becoming **multi-sport**: see §20 for the shared shell (sections registry,
sport switcher, per-sport theming) and the new **Formula 1** section.

---

## 0. Talk style — CAVEMAN SPEAK (chat only)

Assistant **chat replies** use caveman speak to save tokens: short words, drop
filler words (a / the / is), grug-style. This is a hard project convention.

**Never cavemanize** (write normal, correct English/exact tokens): code, code
comments, commit messages, PR titles & bodies, README, CLAUDE.md, and any
literal — file paths, env var names, commands, keys, IDs. Garbling those breaks
things. Caveman speak is for the conversational prose to the user only.

---

## 1. What this is

A static, mobile-first single-page web app for the **2026 FIFA World Cup**
(48 teams, hosts USA/Canada/Mexico). No backend, no database, no login, no
build secrets. Everything runs in the browser and is deployed as static files
on **Netlify**. Live data comes from free, keyless public APIs; a bundled JSON
snapshot is the offline floor so the app always renders.

The app now hosts **multiple sports as sections** under one shared shell
(World Cup soccer + Formula 1). Everything in §§1–19 describes the **soccer**
section unless noted; **§20** covers the shared shell and the **Formula 1**
section.

### Features (each maps to a page/component)
- **Group leaderboard** (home `/`): all 12 group tables (points, W/D/L, GF, GA,
  GD), a "Today's matches" strip, and a "3rd-place race" table (best 8 third
  finishers advance).
- **Schedule** (`/schedule`): weekly calendar view + full list view, all
  kickoff times rendered in the visitor's local time zone. The weekly grid
  supports horizontal **swipe** (left → next week, right → previous) and a
  **"Today"** chip in the week-nav that appears only when you've navigated off
  the current week; the list view auto-scrolls to today each time it opens.
- **Teams** (`/teams`): searchable list of all 48 teams; links to team pages
  and to the compare tool.
- **Team page** (`/team/:slug`): 2026 record + scorers, group position, head
  coach, starting XI + reserves (live from ESPN), full World Cup history,
  titles, all-time top scorer, fun facts; star-to-favorite; deep-link to
  compare.
- **Bracket** (`/bracket`): Round of 32 → Final; placeholder slots ("Winner
  Group A", "Winner of Match 74") resolve as results come in.
- **Golden Boot** (`/scorers`): tournament top scorers (own goals excluded,
  penalties tracked), totals, goals/match.
- **Compare** (`/compare?a=slug&b=slug`): head-to-head pedigree + 2026 form for
  two teams.
- **Live updates**: scores/goals/minute clock update in-app while a match is
  played (adaptive polling). Tap a started match card → match-facts bottom
  sheet (goals, possession, shots, cards, attendance, venue, referee), which
  re-polls while live.
- **Favorite team + dark mode**: persisted on device.
- **Feedback** (✉️ in header): Netlify Forms bottom sheet.
- **PWA**: installable, safe-area aware, app icons.
- **Monetization (off by default)**: one env-gated ad/sponsor slot.
- **Analytics (off by default)**: env-gated PostHog.

---

## 2. Tech stack

- **React 18** + **react-router-dom v6** using **HashRouter** (URLs look like
  `/#/schedule`; required so the static host needs no SPA redirect rules).
- **Vite 5** build (`base: './'` → relative asset paths, works from any path).
- **No UI framework, no CSS framework.** One hand-written stylesheet
  (`src/styles.css`) with CSS custom properties and a `[data-theme]` switch.
- **posthog-js** is the only runtime dependency beyond React/router, and it is
  lazy-imported (never loaded unless analytics is configured).
- Dev/test tooling: **esbuild** (bundles the test suite) — that's the whole
  test runner; no Jest/Vitest.

`package.json` scripts:
- `npm run dev` — Vite dev server.
- `npm run build` — production build to `dist/`.
- `npm run preview` — serve the built `dist/`.
- `npm test` — `node scripts/run-tests.mjs` (logic tests + SSR-render every
  route; no browser needed).
- `npm run update-data` — regenerate `src/data/schedule.json` from openfootball.
- `npm run update-icons` — regenerate PWA icons.

**Always run `npm test` and `npm run build` before committing.**

---

## 3. Repository layout

```
index.html                 # app shell + PWA meta + hidden Netlify <form> for detection
vite.config.js             # base './', loadEnv, ads.txt emitter plugin
package.json
PLAN.md                    # blueprint for the current initiative (multi-sport / F1)
TASKS.md                   # phased checklist for the current initiative
.env.example               # documents every VITE_* env var (all optional)
public/                    # manifest.webmanifest, icon-192/512.png, apple-touch-icon.png
scripts/
  generate-schedule.mjs    # openfootball -> src/data/schedule.json
  generate-icons.mjs       # dependency-free PNG icon generator
  run-tests.mjs            # esbuild-bundles tests/suite.test.jsx then runs it
tests/suite.test.jsx       # the whole test suite (logic + SSR smoke)
src/
  main.jsx                 # ReactDOM root: HashRouter > DataProvider > App
  App.jsx                  # shell: sport switcher, feedback/refresh/theme, section-aware tab bar, routes, AdSlot, analytics
  styles.css               # all styling (CSS variables, themes, components)
  data/
    schedule.json          # bundled 104-match schedule (generated; offline floor)
    teams.json             # curated per-team data for all 48 teams (hand-maintained)
  lib/
    data.jsx               # DataProvider, polling, match merge, matchStatus/finalScore/isInPlay/nextRefreshDelay
    espn.js                # ESPN parsing + merge: scoreboard, summary (facts), lineups
    standings.js           # computeGroups, thirdPlaceRace, teamTournamentRecord
    scorers.js             # goldenBoot, tournamentTotals
    format.js              # time/date formatting, STADIUMS, placeholderLabel, scoreline, liveLabel
    prefs.js               # useTheme, useFavorite (localStorage-backed, cross-component sync)
    analytics.js           # env-gated PostHog (init/track/trackPageview/normalizeRoute)
    sections.js            # SECTIONS registry + sectionForPath (multi-sport shell)
  components/
    TeamTag.jsx            # flag + name link (or muted placeholder for "1A"/"W74")
    MatchCard.jsx          # one match: live/HT/FT score, badges, opens MatchFacts
    MatchFacts.jsx         # bottom-sheet match details (re-polls while live)
    Lineup.jsx             # coach + starting XI (grouped) + reserves, from ESPN
    AdSlot.jsx             # env-gated AdSense / sponsor / dev placeholder
    FeedbackForm.jsx       # Netlify-Forms bottom sheet
    SportSwitcher.jsx      # top-bar sport dropdown (multi-sport shell)
  pages/                   # soccer pages
    GroupsPage.jsx  SchedulePage.jsx  TeamsPage.jsx  TeamPage.jsx
    BracketPage.jsx  ScorersPage.jsx  ComparePage.jsx
  f1/                      # Formula 1 section (isolated)
    data/                  # MOCK sample data: teams, drivers, circuits, calendar, index
    components/            # F1TeamLogo (logo-or-fallback-badge)
    pages/                 # F1Calendar/Standings/Teams/Team/Drivers/Driver/Circuits/Circuit
public/f1/logos/           # drop <team-slug>.svg here to show real constructor logos
```

---

## 4. Data model

### 4.1 Match object (in-memory; produced by `buildMatches`)
Derived from bundled `schedule.json`, then mutated by openfootball + ESPN
overlays. Shape:
```js
{
  key: "2026-06-11|Mexico City", // `${date}|${ground}`, unique across 104 matches
  index: 0,                       // original order in schedule
  stage: "group",                 // group | r32 | r16 | qf | sf | third | final
  round: "Matchday 1",            // raw round label from openfootball
  group: "A",                     // group letter, or null for knockout
  team1: "Mexico", team2: "South Africa", // canonical names, or placeholders ("1A","W74")
  kickoff: "2026-06-11T13:00:00-06:00",   // ISO with source offset; rendered in user TZ
  city: "Mexico City",
  matchNumber: 73,                // knockout only (73..104), for "Winner of Match N"
  // overlaid live/result fields (all optional):
  score: { ht:[1,0], ft:[2,1], et:[3,3], p:[4,2] } | null,
  goals1: [{ name, minute, penalty?, owngoal? }], goals2: [...],
  live: { score:[h,a], clock:"67'", period, state } | undefined, // in-play only
  liveState: "1h"|"ht"|"2h"|"et"|"pens"|"ft" | undefined,
  espnId: "731234" | undefined,   // ESPN event id, enables match facts/lineups
}
```
**Invariant (critical):** `score.ft` is set **only when a match is final**.
The in-play current score lives on `match.live` and is kept out of `score.ft`
so the standings (which read `score.ft`) never count an in-progress match.
`score.ht` may be recorded mid-match.

### 4.2 `teams.json` (curated, hand-maintained — 48 entries keyed by canonical name)
```js
"Brazil": {
  slug: "brazil",                // URL slug for /team/:slug
  flag: "🇧🇷",                    // emoji flag
  confederation: "CONMEBOL",
  coach: "Carlo Ancelotti",      // curated head coach (verify/correct as needed)
  nickname: "Seleção",
  firstAppearance: 1930,
  titles: [1958,1962,1970,1994,2002], // championship years
  bestFinish: "Champions (×5)",
  history: [{ year:1930, result:"Group stage" }, ...], // per-tournament results
  topScorer: { name:"Ronaldo", goals:15 }, // all-time WC top scorer (optional)
  legend: "Pelé",                // iconic player (optional)
  facts: ["...", "..."],         // 2–4 fun facts
}
```
Canonical team names are the openfootball spellings (e.g. `USA`, `Turkey`,
`Bosnia & Herzegovina`, `Ivory Coast`, `Curaçao`, `DR Congo`, `South Korea`,
`Czech Republic`). Curated data sourced from Wikipedia/FIFA records through
2022. This is the place to fix any data error — it's one file.

### 4.3 `schedule.json` (generated; do not hand-edit)
`{ generatedAt, source, matches: [...] }`. Regenerate with
`npm run update-data` (`scripts/generate-schedule.mjs` fetches openfootball,
parses `"13:00 UTC-6"` style times into ISO, assigns `stage`/`matchNumber`).

---

## 5. Data flow & live updates (`src/lib/data.jsx`)

`DataProvider` (React context) owns the match list and refresh loop.

- **Sources, layered in this order** inside `buildMatches`:
  1. bundled `schedule.json` (cloned each rebuild — the offline floor),
  2. **openfootball** overlay (`applyOpenfootball`) — schedule + slower scores,
  3. **ESPN** overlay (`applyEspn`) — primary live scores/goals/state, applied
     last so its fresher data wins.
- **Fetched** client-side on mount and on an **adaptive timer**:
  - `LIVE_MS = 25s` when any match is in play or kicks off within `SOON_MS=5min`,
  - `IDLE_MS = 5min` otherwise,
  - only while `document.visibilityState === 'visible'` (battery/data friendly);
  - re-fetch immediately on tab re-focus.
  - Scheduler is a self-rescheduling `setTimeout` reading `nextRefreshDelay(matches)`.
- **Caching:** last good payloads saved to `localStorage`
  (`wc26.liveData.v1` = openfootball, `wc26.espnData.v1` = ESPN events) and
  replayed on next load so the app opens with recent data offline.
- **Fail-soft:** every fetch/parse is wrapped; a bad payload never breaks the
  UI — it just keeps the previous state.

### Status helpers (exported from `data.jsx`)
- `matchStatus(m, now=new Date())` → one of
  `upcoming | 1h | ht | 2h | et | pens | live | pending | ft`. Precedence:
  `liveState` (non-ft) → `score.ft|score.p` ⇒ `ft` → `score.ht` ⇒ `ht` → clock
  (≥ kickoff and < 3h ⇒ `live`, else `pending`) → `upcoming`.
- `finalScore(m)` → `score.et ?? score.ft ?? null` (the result to display).
- `isInPlay(status)` → true for `1h/ht/2h/et/pens/live`.
- `nextRefreshDelay(matches, now)` → `LIVE_MS` or `IDLE_MS`.

---

## 6. ESPN integration (`src/lib/espn.js`)

ESPN's public, keyless, CORS-enabled JSON API. **Unofficial** — parse
defensively; if the shape changes the app must degrade to openfootball-only.

- `SCOREBOARD_URL` = `…/soccer/fifa.world/scoreboard?dates=20260610-20260721&limit=300`.
- `summaryUrl(id)` = `…/summary?event=id` (used for both match facts and lineups,
  via one cached `getSummary`).
- `canonName(espnName)` maps ESPN spellings → our canonical names (strips
  accents/case; `ALIASES` covers "United States"→USA, "Türkiye"→Turkey,
  "Korea Republic"→South Korea, "Cabo Verde"→Cape Verde, etc.).
- `parseScoreboard(json)` → normalized events `{ id,date,state,statusName,
  period,displayClock,homeName,awayName,homeScore,awayScore,homeHt,awayHt,
  home90,away90,homeShootout,awayShootout,goals:[homeGoals,awayGoals] }`.
  **HT/90' are reconstructed from goal minutes** when ESPN omits per-period
  linescores mid-match (stoppage time like `45'+3'` parses into the right half).
- `applyEspn(matches, events)` merges events onto matches: time-window + name
  matching, resolves knockout **placeholders** ("W74"/"1A") to real names,
  orients home/away to our team1/team2 (`flipped`), sets `score`/`goals`/`live`/
  `liveState`/`espnId`. Post = final (`ft`/`et`/`p`); in = live (`m.live` +
  `liveState`, records `score.ht` at/after the break). Never writes `score.ft`
  for an in-progress match.
- `parseSummary(json, match)` → `{ stats:[{label,a,b}], info:[[k,v]], teamA,
  teamB }` for the facts sheet (possession/shots/etc. + venue/attendance/referee).
- `parseLineups(json)` → `{ [teamName]: { starters:[], bench:[] } }`; each
  player `{ name, number, starter, captain, group }` where `group` is bucketed
  by `bucketPosition` into `GK|DEF|MID|FWD|OTH` (sorted by shirt number).
- `fetchMatchFacts(match)` / `fetchLineups(match)` share `getSummary` (caches
  the raw summary once the match is final).

---

## 7. Standings & scorers (pure functions)

`src/lib/standings.js`:
- `computeGroups(matches)` → `{ A:[rowsSorted], ... }`. Row = `{team,mp,w,d,l,
  gf,ga,gd,pts}`. **Sort:** points → goal difference → goals for → head-to-head
  result between the tied pair → name. Only counts matches with `score.ft`.
- `thirdPlaceRace(groups)` → the 12 third-placed teams sorted by pts/GD/GF/name
  (best 8 advance).
- `teamTournamentRecord(matches, team)` → `{mp,w,d,l,gf,ga}` across all stages
  (uses `et` over `ft` when present).

`src/lib/scorers.js`:
- `goldenBoot(matches)` → `[{name,team,goals,pens}]` sorted by goals, then fewer
  pens, then name. **Own goals excluded.**
- `tournamentTotals(matches)` → `{played, goals}`.

---

## 8. Formatting (`src/lib/format.js`)
- `fmtTime/fmtDate/fmtDateLong` use `toLocaleString` with no explicit zone →
  **the visitor's local time zone** (kickoffs carry source offsets).
- `dayKey(date)` → local `YYYY-MM-DD` (via `en-CA`) for grouping by day.
- `tzLabel()` → resolved IANA zone for the "times in your zone" note.
- `STADIUMS` maps host city → stadium name; `shortCity` trims parenthetical.
- `placeholderLabel("1A"|"3A/B/.."|"W74")` → readable "Winner Group A" etc.
- `scoreline(score)` → "3 – 3 (4–2 pens)"; `liveLabel(status, clock)` → "67'",
  "HT", "PENS", "ET", or "LIVE".

---

## 9. Preferences (`src/lib/prefs.js`)
`usePersistent(key, initial)` = localStorage-backed state that **syncs across
all hook instances** (same tab via a `prefs-sync` CustomEvent, other tabs via
`storage`). Exposes `useTheme()` (`wc26.theme`, sets `document.documentElement
.dataset.theme`, defaults to system `prefers-color-scheme`) and `useFavorite()`
(`wc26.favoriteTeam`).

---

## 10. Analytics (`src/lib/analytics.js`) — env-gated, off by default
- Enabled only if `VITE_POSTHOG_KEY` is set; otherwise every function is a
  no-op and **posthog-js is never imported** (it's a lazy `import()` chunk).
- `initAnalytics()` dynamically imports posthog-js and inits with
  `capture_pageview:false` (HashRouter is invisible to History-API auto
  pageviews), `autocapture:true`, `persistence:'localStorage'` (cookieless),
  `person_profiles:'identified_only'` (anonymous).
- `trackPageview(pathname)` is called from `App` on every route change; sends a
  clean `$current_url` plus a normalized `route` (`normalizeRoute` collapses
  `/team/<x>` → `/team/:slug`).
- `track(event, props)` for named events already wired:
  `team_viewed, match_facts_opened, favorite_set, favorite_cleared,
  schedule_view_changed, schedule_week_changed, schedule_today, teams_compared,
  theme_toggled, feedback_opened, feedback_submitted`.
- Host defaults to `https://us.i.posthog.com`; override with `VITE_POSTHOG_HOST`.

---

## 11. Ads (`src/components/AdSlot.jsx`) — env-gated, off by default
One responsive slot, mounted once per route at the bottom of `<main>` (`App`
keys it by `location.pathname` so a genuine navigation requests a fresh ad).
Three modes: **AdSense** (`VITE_ADSENSE_CLIENT`+`VITE_ADSENSE_SLOT`; lazy-loads
the loader, `ads.txt` is emitted by the Vite plugin from the publisher id) →
**sponsor banner** (`VITE_SPONSOR_IMAGE`+`VITE_SPONSOR_URL`) → **nothing** in
prod (dev shows a labelled placeholder). Renders `''` when unconfigured.

---

## 12. Feedback (`src/components/FeedbackForm.jsx`) — Netlify Forms
- A **hidden static `<form name="feedback">`** lives in `index.html` so
  Netlify's build-time parser registers the form and its fields
  (`feedback-type`, `message`, `page`, `bot-field` honeypot). Field names in
  the React form and the static form **must match**.
- The React form submits via `fetch('/', urlencoded)` including
  `form-name=feedback` so the SPA never reloads. Submissions are stored **only
  on the deployed Netlify site** (local dev shows a friendly error).
- Opens as a **bottom sheet** reusing `.sheet`/`.sheet-backdrop`; the feedback
  sheet uses `.feedback-backdrop` to anchor near the top so the on-screen
  keyboard doesn't cover the inputs.
- Captures the current route in the hidden `page` field.

---

## 13. Styling system (`src/styles.css`)
- **Mobile-first.** App is a max-width 760px column with a sticky top bar and a
  fixed bottom **tab bar** (5 tabs). Content has bottom padding to clear it.
- **Theme via CSS variables** on `:root` and `[data-theme='dark']`:
  `--bg --card --text --muted --line --accent --accent-soft --good --good-soft
  --warn-soft --star --live --live-soft --tabbar`. Use these tokens; don't
  hardcode colors.
- **Safe areas:** top bar pads `env(safe-area-inset-top)`, tab bar pads
  `inset-bottom`, for installed-PWA full-screen.
- **Bottom sheet** pattern (`.sheet-backdrop` + `.sheet`) is reused by
  MatchFacts and FeedbackForm; locks body scroll while open; Esc closes.
- **Live UI:** `.badge.live-badge` with pulsing `.live-dot`, `.score.live-score`
  and `.match-card.is-live` outline use `--live`.
- Keep the stylesheet plain and grouped by section with comment headers. No
  CSS-in-JS, no preprocessor.

---

## 14. Environment variables (all optional; set in Netlify, not committed)
| Var | Purpose |
|-----|---------|
| `VITE_ADSENSE_CLIENT` / `VITE_ADSENSE_SLOT` | enable AdSense slot + emit `ads.txt` |
| `VITE_SPONSOR_IMAGE` / `VITE_SPONSOR_URL` / `VITE_SPONSOR_ALT` | sponsor banner fallback |
| `VITE_POSTHOG_KEY` | enable PostHog analytics |
| `VITE_POSTHOG_HOST` | PostHog region host (default US) |

`.env` files are gitignored (`.env.example` is the template). Everything
env-gated must be a **no-op / render nothing when unset** — the default build
ships clean with no ads and no tracking.

---

## 15. Testing (`npm test`)
`scripts/run-tests.mjs` esbuild-bundles `tests/suite.test.jsx` (JSX + JSON
imports) and runs it in Node. The suite:
- unit-tests standings (incl. head-to-head + 3rd-place), golden boot, formats,
  and **all ESPN parsing/merge** (orientation, placeholders, HT derivation,
  ET/pens, live snapshot kept out of `score.ft`, lineups, summary);
- asserts adaptive poll cadence and analytics no-op when unconfigured;
- **server-renders every route** as a smoke test (no browser).
Add a `check(label, got, want)` assertion for any new logic. Keep tests
browser-free.

---

## 16. Build & deploy
- `npm run build` → static `dist/` (relative paths, hash routing) → host
  anywhere (Netlify in production). `vite.config.js` also emits `ads.txt` when
  the AdSense client is set.
- Netlify auto-detects the hidden feedback form at build.
- PWA: `public/manifest.webmanifest` + icons; `index.html` has theme-color and
  apple-touch metas.

---

## 17. Coding style & conventions
- **2-space indent, no semicolons, single quotes** (Prettier-ish defaults).
  Match the surrounding file.
- Functional React components + hooks only. No class components.
- Keep **pure logic in `src/lib/*`** (testable, framework-free) and rendering in
  components/pages. Add tests for new lib logic.
- **Comments explain "why"/invariants**, not "what". Keep them sparse and
  accurate (e.g. the `score.ft` vs `live` invariant).
- **Fail soft** on any network/parse path; never let external data crash the UI.
- **Env-gate** anything optional/external; default build is clean and silent.
- Reuse existing patterns: `usePersistent` for device prefs, the bottom-sheet
  pattern for modals, `track()` for analytics events, CSS variables for color.
- Prefer no new dependencies. The app is intentionally tiny.
- Run `npm test` and `npm run build` before committing. Commits/PRs in normal
  English.

### Branch & push policy (IMPORTANT)
- **Push only to the `development` branch.** Never push to `main` (the branch
  Netlify deploys to production) except by the user's **direct, explicit
  request**. Day-to-day feature work lands on `development`.
- Commit identity is `Claude <noreply@anthropic.com>`. Commits made in the
  sandbox are unsigned (no signing key) and GitHub shows them "Unverified" —
  this is expected and harmless; do not churn history trying to "fix" it.

---

## 18. Key invariants & gotchas (read before changing data flow)
1. `score.ft` ⇒ match is final. In-play score is `match.live.score` only.
   Standings/golden-boot logic depends on this separation.
2. HashRouter ⇒ analytics pageviews are manual (`trackPageview` on route
   change); don't rely on PostHog auto-capture for navigation.
3. `match.key` = `date|city` is the stable id used to merge feeds; keep it
   unique and stable.
4. ESPN is unofficial — all parsing is defensive and reconstructs HT/90' from
   goal minutes when linescores are missing.
5. Times are stored with source offsets and always rendered in the visitor's
   zone — never hardcode a zone.
6. Curated data (`teams.json`) may drift (coaches, facts); it's the single file
   to correct, and the UI must tolerate missing optional fields.
7. Everything optional is env-gated and a no-op when unset.

---

## 19. Recipe: add a feature
1. Pure logic → a function in `src/lib/*` (+ a `check(...)` test).
2. UI → a component/page using existing CSS tokens and patterns.
3. Wire route in `App.jsx` if it's a page; add a tab if top-level.
4. Add a `track('event_name', {...})` call for meaningful interactions.
5. `npm test` + `npm run build`, then commit on the feature branch.

---

## 20. Multi-sport architecture (sections)
The app hosts several **sports** under one shell. Soccer (World Cup) is the
default section; **Formula 1** is the second. Adding a sport is meant to be
**additive** — a config entry plus that sport's pages/data — with no rework of
existing sports. See `PLAN.md` for the full blueprint and `TASKS.md` for status.

### 20.1 Section registry (`src/lib/sections.js`)
`SECTIONS` is an ordered array; each entry:
`{ id, sport, emoji, title, home, tabs:[{ to, end?, emoji, label }] }`.
- `id` is stable and doubles as the `data-section` theming hook.
- `home` is the landing route (`'/'` for soccer, `'/f1'` for F1).
- `tabs` defines the bottom tab bar verbatim.
`sectionForPath(pathname)` returns the active section by URL prefix
(`pathname === home || pathname.startsWith(home + '/')`), else `SECTIONS[0]`.
**The URL is the single source of truth for the active sport** — no global
state — so deep links/reloads preserve it (fits `HashRouter`).

### 20.2 Shell wiring (`App.jsx`)
`App` calls `sectionForPath(location.pathname)` once and uses it to: set
`data-section={section.id}` on `.app`, render `section.title` in the top bar,
and render `section.tabs` as the tab bar. Routes for all sports are registered
in the one `<Routes>`; each sport's routes live under its `home` prefix.

### 20.3 Sport switcher (`src/components/SportSwitcher.jsx`)
The top-bar title is a dropdown button (replaces the old "title → home" link).
It lists every `SECTIONS` entry; selecting navigates to that section's `home`.
A `▾`/`▴` caret signals it; the active sport is checked; closes on select,
outside-click, or Esc; `aria-haspopup`/`aria-expanded`/`menuitemradio`.

### 20.4 Top-bar layout
Right side is two rows: row 1 the update/live chip (soccer) or a **"Sample
data"** chip (F1 while mocked); row 2 feedback ✉️ + dark-mode 🌙.

### 20.5 Per-sport accent
`[data-section='<id>']` in `styles.css` overrides `--accent`/`--accent-soft`.
F1 → red (`#e10600` light, `#ff5a52` dark). Soccer keeps blue. Reverting F1 red
is just deleting those two blocks. **Status: F1 red is provisional** pending an
in-app look; may revert to the default accent.

### 20.6 Formula 1 section (`src/f1/`)
Tabs (L→R): **📅 Calendar** (`/f1`, home) · **🏆 Standings** (`/f1/standings`) ·
**🏎️ Teams** (`/f1/teams`) · **🧑‍✈️ Drivers** (`/f1/drivers`) · **🏟️ Circuits**
(`/f1/circuits`). Detail routes: `/f1/team/:slug`, `/f1/driver/:slug`,
`/f1/circuit/:slug`. **Calendar is the section home** — selecting Grand Prix in
the switcher lands there.
- The **Calendar** lists each round with its **start time in the visitor's local
  zone** (each round has a `start` ISO carrying the circuit's UTC offset; rendered
  with the shared `fmtTime`/`fmtDate` from `src/lib/format.js`).
- The **Standings** page opens each championship with a newcomer-friendly
  explainer (how drivers/constructors score points).
- The **Team page** shows a constructor **plus its drivers** (their stats/facts).
- The **Driver page** shows bio + season stats + **per-GP results, most recent
  first** (the "Wins" surface).
- The **Circuit page** shows track facts + **fastest-lap record**.

**Team logos:** `src/f1/components/F1TeamLogo.jsx` renders
`public/f1/logos/<slug>.svg`, falling back to a color badge (team color +
`abbr`) when the file is absent. Drop logo files into `public/f1/logos/` to light
them up (convention in that folder's README). Logos are user-supplied
(trademarks) — none are committed.

**Data is MOCK** for now — `src/f1/data/{teams,drivers,circuits,calendar}.js`
with `index.js` lookups/derivations. Clearly labelled placeholder; shapes chosen
to map onto the real feeds. Season aggregates are hard-coded; per-race finishing
order lives once in `calendar.js` and feeds the Driver pages.
**Future real data:** F1DB snapshot → **Jolpica-F1** (`api.jolpi.ca`, free,
drop-in Ergast successor) overlay → **OpenF1** (`api.openf1.org`) live; Ergast is
dead. Verify CORS + OpenF1 rate limits before wiring. (See `PLAN.md` §4.)

### 20.7 Recipe: add a sport
1. Add a `SECTIONS` entry (`src/lib/sections.js`).
2. Create `src/<sport>/pages/*` and `src/<sport>/data/*`.
3. Register its routes in `App.jsx` under the section's `home` prefix.
4. Optional `[data-section='<id>']` accent block in `styles.css`.
5. Add the new routes to the SSR smoke test in `tests/suite.test.jsx`.
6. `npm test` + `npm run build`; commit on `development`.

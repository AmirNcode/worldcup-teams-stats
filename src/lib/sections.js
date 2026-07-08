// Registry of sports ("sections"). Each entry fully describes a sport's shell:
// its top-bar title and its bottom tab bar. Adding a sport is additive — append
// an entry here, create its pages/data, and register its routes in App.jsx.
//
// The active section is derived from the URL prefix (sectionForPath), so the URL
// is the single source of truth for which sport is active. That means deep links
// and reloads preserve the sport with no extra state, which suits HashRouter.

export const SECTIONS = [
  {
    id: 'soccer',
    sport: 'International Football',
    emoji: '🏆',
    title: 'World Cup 2026',
    home: '/',
    tabs: [
      { to: '/schedule', emoji: '📅', label: 'Schedule' },
      { to: '/', end: true, emoji: '🏆', label: 'Bracket' },
      { to: '/teams', emoji: '🔎', label: 'Teams' },
      { to: '/groups', emoji: '📊', label: 'Groups' },
      { to: '/scorers', emoji: '👟', label: 'Boot' },
    ],
  },
  {
    id: 'leagues',
    sport: 'Club Football',
    emoji: '⚽',
    title: 'Top Leagues',
    home: '/leagues',
    // tab `to` values name the default league; App.jsx substitutes the active
    // league slug from the URL so the tabs follow the league being viewed
    tabs: [
      { to: '/leagues/epl', end: true, emoji: '📊', label: 'Table' },
      { to: '/leagues/epl/fixtures', emoji: '📅', label: 'Fixtures' },
      { to: '/leagues/epl/teams', emoji: '🔎', label: 'Teams' },
      { to: '/leagues/epl/scorers', emoji: '👟', label: 'Boot' },
    ],
  },
  {
    id: 'f1',
    sport: 'Formula 1',
    emoji: '🏁',
    title: 'Grand Prix 2026',
    home: '/f1',
    tabs: [
      { to: '/f1', end: true, emoji: '📅', label: 'Calendar' },
      { to: '/f1/drivers', emoji: '🧑‍✈️', label: 'Drivers' },
      { to: '/f1/teams', emoji: '🏎️', label: 'Teams' },
      { to: '/f1/circuits', emoji: '🏟️', label: 'Circuits' },
      { to: '/f1/stats', emoji: '📊', label: 'Stats' },
    ],
  },
]

// The active section for a path: the first non-root section whose home matches
// the path exactly or as a path segment prefix, else the default (first) section.
// Match on a segment boundary so e.g. '/f1' never swallows a future '/f1x'.
export function sectionForPath(pathname) {
  return (
    SECTIONS.find(
      (s) => s.home !== '/' && (pathname === s.home || pathname.startsWith(s.home + '/')),
    ) ?? SECTIONS[0]
  )
}

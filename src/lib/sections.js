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
    sport: 'Soccer',
    emoji: '🏆',
    title: 'World Cup 2026',
    home: '/',
    tabs: [
      { to: '/', end: true, emoji: '📊', label: 'Groups' },
      { to: '/schedule', emoji: '📅', label: 'Schedule' },
      { to: '/teams', emoji: '🔎', label: 'Teams' },
      { to: '/bracket', emoji: '🏆', label: 'Bracket' },
      { to: '/scorers', emoji: '👟', label: 'Boot' },
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

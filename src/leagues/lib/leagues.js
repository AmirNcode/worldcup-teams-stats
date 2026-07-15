// Registry of the league-soccer competitions. A league is pure config: this
// entry plus the shared parameterized pages is all it takes, so adding a
// league is one line here. `id` is the URL slug and the model key everywhere;
// `espn` is the ESPN league code and never leaks outside the data layer.
// `award` is the league's real top-scorer trophy, shown on the Scorers page.
export const LEAGUES = [
  { id: 'epl', espn: 'eng.1', name: 'Premier League', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', award: 'Golden Boot' },
  { id: 'laliga', espn: 'esp.1', name: 'La Liga', country: 'Spain', flag: '🇪🇸', award: 'Pichichi Trophy' },
  { id: 'seriea', espn: 'ita.1', name: 'Serie A', country: 'Italy', flag: '🇮🇹', award: 'Capocannoniere' },
  { id: 'bundesliga', espn: 'ger.1', name: 'Bundesliga', country: 'Germany', flag: '🇩🇪', award: 'Torjägerkanone' },
  { id: 'ligue1', espn: 'fra.1', name: 'Ligue 1', country: 'France', flag: '🇫🇷', award: 'Trophée du Meilleur Buteur' },
]

export const DEFAULT_LEAGUE = LEAGUES[0].id

export const leagueById = (id) => LEAGUES.find((l) => l.id === id) ?? null

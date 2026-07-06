// ESPN's public, keyless, CORS-enabled JSON API for domestic league soccer —
// the same host the World Cup section uses for live scores, but the league
// standings/scoreboard shapes differ from the tournament ones, so the parsers
// live here. Unofficial API: parse defensively, a bad payload must never crash
// the UI (callers fall back to the bundled snapshot).
//
// Parsers are pure; the fetch helpers take an injected `getJson` so they are
// shared by the live provider and the Node snapshot generator (same pattern as
// the F1 layer's fetchAllResults).

const V2 = 'https://site.api.espn.com/apis/v2/sports/soccer'
const SITE = 'https://site.api.espn.com/apis/site/v2/sports/soccer'

export const standingsUrl = (code, season) =>
  season ? `${V2}/${code}/standings?season=${season}` : `${V2}/${code}/standings`
export const scoreboardUrl = (code, range) => `${SITE}/${code}/scoreboard?dates=${range}&limit=100`

// YYYYMMDD-YYYYMMDD range covering [now + fromDays, now + toDays]
export const dateRange = (fromDays, toDays, now = new Date()) => {
  const day = (offset) => {
    const d = new Date(now.getTime() + offset * 86400000)
    return d.toISOString().slice(0, 10).replaceAll('-', '')
  }
  return `${day(fromDays)}-${day(toDays)}`
}

const num = (v) => (v == null || v === '' ? null : Number(v))

// → { season, seasonYear, rows: [{ rank, teamId, name, abbrev, logo,
//      played, w, d, l, gf, ga, gd, pts, note }] } sorted by rank
export function parseLeagueStandings(json) {
  const entries = json?.children?.[0]?.standings?.entries ?? []
  const rows = entries.map((e) => {
    const stats = {}
    for (const s of e.stats ?? []) stats[s.name] = s.value ?? s.displayValue
    return {
      rank: num(stats.rank),
      teamId: e.team?.id ?? null,
      name: e.team?.displayName ?? '',
      abbrev: e.team?.abbreviation ?? '',
      logo: e.team?.logos?.[0]?.href ?? null,
      played: num(stats.gamesPlayed) ?? 0,
      w: num(stats.wins) ?? 0,
      d: num(stats.ties) ?? 0,
      l: num(stats.losses) ?? 0,
      gf: num(stats.pointsFor) ?? 0,
      ga: num(stats.pointsAgainst) ?? 0,
      gd: num(stats.pointDifferential) ?? 0,
      pts: num(stats.points) ?? 0,
      // ESPN's qualification/relegation annotation, e.g. "Champions League"
      note: e.note?.description ?? null,
      noteColor: e.note?.color ?? null,
    }
  })
  rows.sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
  return {
    season: json?.season?.displayName ?? null,
    seasonYear: json?.season?.year ?? null,
    rows,
  }
}

// → [{ id, date, name, state, detail, home, away }] sorted by kickoff;
// state ∈ pre | in | post, scores are numbers for started matches else null
export function parseLeagueScoreboard(json) {
  const events = json?.events ?? []
  const matches = events.map((ev) => {
    const comp = ev.competitions?.[0]
    const side = (which) => {
      const c = (comp?.competitors ?? []).find((x) => x.homeAway === which)
      const started = ev.status?.type?.state !== 'pre'
      return {
        id: c?.team?.id ?? null,
        name: c?.team?.displayName ?? '',
        abbrev: c?.team?.abbreviation ?? '',
        logo: c?.team?.logo ?? null,
        score: started ? num(c?.score) : null,
      }
    }
    return {
      id: ev.id,
      date: ev.date,
      name: ev.name ?? '',
      state: ev.status?.type?.state ?? 'pre',
      detail: ev.status?.type?.detail ?? '',
      home: side('home'),
      away: side('away'),
    }
  })
  matches.sort((a, b) => String(a.date).localeCompare(String(b.date)))
  return matches
}

// Standings for the season people care about: ESPN flips its default season to
// the upcoming one during the summer break (an all-zero alphabetical table), so
// when no games have been played yet, fall back to the previous season's final
// table. Rolls forward automatically once the new season kicks off.
export async function fetchLeagueStandings(getJson, code) {
  const current = parseLeagueStandings(await getJson(standingsUrl(code)))
  const unplayed = current.rows.length > 0 && current.rows.every((r) => r.played === 0)
  if (!unplayed || !current.seasonYear) return current
  const prev = parseLeagueStandings(await getJson(standingsUrl(code, current.seasonYear - 1)))
  return prev.rows.length ? prev : current
}

// Recent results + upcoming fixtures around `now`. Near windows are ±3 weeks;
// when one comes back empty (summer break, fixtures not yet published) it is
// widened once so the page still shows the last played and first scheduled
// matchweeks. Windows are fetched sequentially and deduped by event id.
export async function fetchLeagueMatches(getJson, code, now = new Date()) {
  const window = async (fromDays, toDays) =>
    parseLeagueScoreboard(await getJson(scoreboardUrl(code, dateRange(fromDays, toDays, now))))
  let past = await window(-21, 0)
  if (!past.length) past = await window(-90, 0)
  let future = await window(1, 21)
  if (!future.length) future = await window(1, 120)
  // the page shows a window, not a season: keep ~2 matchweeks each way even
  // when a widened fetch returned months of games
  past = past.slice(-20)
  future = future.slice(0, 20)
  const seen = new Set()
  return [...past, ...future].filter((m) => {
    if (seen.has(m.id)) return false
    seen.add(m.id)
    return true
  })
}

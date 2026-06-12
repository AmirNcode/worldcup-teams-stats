// ESPN's public (keyless, CORS-enabled) soccer API. Primary source for live
// scores and match stats; openfootball remains the fallback since this API is
// unofficial. Everything here parses defensively — if ESPN changes shape or is
// unreachable, the app simply behaves as if this layer doesn't exist.
import teams from '../data/teams.json'

const LEAGUE = 'fifa.world'
const BASE = `https://site.api.espn.com/apis/site/v2/sports/soccer/${LEAGUE}`
export const SCOREBOARD_URL = `${BASE}/scoreboard?dates=20260610-20260721&limit=300`
export const summaryUrl = (id) => `${BASE}/summary?event=${id}`

function strip(name) {
  return String(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

// ESPN naming -> our canonical (openfootball) team names.
const ALIASES = {
  'united states': 'USA',
  usmnt: 'USA',
  turkiye: 'Turkey',
  'bosnia and herzegovina': 'Bosnia & Herzegovina',
  "cote d'ivoire": 'Ivory Coast',
  czechia: 'Czech Republic',
  'cape verde islands': 'Cape Verde',
  'cabo verde': 'Cape Verde',
  'congo dr': 'DR Congo',
  'democratic republic of the congo': 'DR Congo',
  'ir iran': 'Iran',
  'korea republic': 'South Korea',
}

const OUR_NAMES = new Map(Object.keys(teams).map((n) => [strip(n), n]))

export function canonName(espnName) {
  if (!espnName) return null
  const s = strip(espnName)
  return ALIASES[s] ?? OUR_NAMES.get(s) ?? null
}

function num(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function parseMinute(clockText) {
  const m = /(\d+)/.exec(String(clockText ?? ''))
  return m ? parseInt(m[1], 10) : null
}

// First-half goals per competitor, from per-period linescores.
function periodGoals(competitor, period) {
  const ls = competitor?.linescores
  if (!Array.isArray(ls) || ls.length < period) return null
  return num(ls[period - 1]?.value ?? ls[period - 1]?.displayValue)
}

function goalsFromDetails(details, homeId) {
  const home = []
  const away = []
  for (const d of details ?? []) {
    if (!d?.scoringPlay) continue
    const text = d.type?.text ?? ''
    if (/shootout/i.test(text)) continue
    const entry = {
      name: d.athletesInvolved?.[0]?.displayName ?? 'Goal',
      minute: parseMinute(d.clock?.displayValue),
    }
    if (d.penaltyKick || /penalty/i.test(text)) entry.penalty = true
    if (d.ownGoal || /own goal/i.test(text)) entry.owngoal = true
    // ESPN credits the goal to the team it counts for (incl. own goals).
    if (String(d.team?.id) === String(homeId)) home.push(entry)
    else away.push(entry)
  }
  return [home, away]
}

// Normalize a scoreboard payload into simple event objects.
export function parseScoreboard(json) {
  const out = []
  for (const ev of json?.events ?? []) {
    const comp = ev.competitions?.[0]
    const competitors = comp?.competitors
    if (!Array.isArray(competitors) || competitors.length !== 2) continue
    const home = competitors.find((c) => c.homeAway === 'home') ?? competitors[0]
    const away = competitors.find((c) => c !== home)
    const status = ev.status ?? comp?.status
    out.push({
      id: String(ev.id ?? comp?.id ?? ''),
      date: ev.date ?? comp?.date,
      state: status?.type?.state ?? 'pre', // pre | in | post
      statusName: status?.type?.name ?? '',
      period: num(status?.period) ?? 0,
      homeName: canonName(home.team?.displayName ?? home.team?.name),
      awayName: canonName(away.team?.displayName ?? away.team?.name),
      homeScore: num(home.score),
      awayScore: num(away.score),
      homeHt: periodGoals(home, 1),
      awayHt: periodGoals(away, 1),
      home90:
        periodGoals(home, 1) != null && periodGoals(home, 2) != null
          ? periodGoals(home, 1) + periodGoals(home, 2)
          : null,
      away90:
        periodGoals(away, 1) != null && periodGoals(away, 2) != null
          ? periodGoals(away, 1) + periodGoals(away, 2)
          : null,
      homeShootout: num(home.shootoutScore),
      awayShootout: num(away.shootoutScore),
      goals: goalsFromDetails(comp?.details, home.team?.id ?? home.id),
    })
  }
  return out
}

const HOUR = 3600e3

// Overlay ESPN events onto our match list (mutates the passed clones).
// Scores appear at half-time and full-time only — the milestones the site
// promises — never minute-by-minute.
export function applyEspn(matches, events) {
  for (const ev of events) {
    if (!ev.date) continue
    const t = new Date(ev.date).getTime()
    let best = null
    let single = null
    for (const m of matches) {
      const dt = Math.abs(new Date(m.kickoff).getTime() - t)
      if (dt > 6 * HOUR) continue
      const hit =
        (m.team1 === ev.homeName || m.team1 === ev.awayName ? 1 : 0) +
        (m.team2 === ev.homeName || m.team2 === ev.awayName ? 1 : 0)
      if (hit === 2) {
        best = m
        break
      }
      if (hit === 1 && dt <= 2 * HOUR && !single) single = m
    }
    if (!best) best = single
    if (!best && ev.homeName && ev.awayName) {
      // knockout slot still showing placeholders: adopt by kickoff time
      const cands = matches.filter(
        (m) =>
          Math.abs(new Date(m.kickoff).getTime() - t) <= HOUR &&
          (!OUR_NAMES.has(strip(m.team1)) || !OUR_NAMES.has(strip(m.team2))),
      )
      if (cands.length === 1) best = cands[0]
    }
    if (!best) continue

    // resolve placeholder slots ("W74", "1A") with the real team names
    if (ev.homeName && ev.awayName) {
      const placeholder1 = !OUR_NAMES.has(strip(best.team1))
      const placeholder2 = !OUR_NAMES.has(strip(best.team2))
      if (placeholder1 && placeholder2) {
        best.team1 = ev.homeName
        best.team2 = ev.awayName
      } else if (placeholder1) {
        best.team1 = best.team2 === ev.homeName ? ev.awayName : ev.homeName
      } else if (placeholder2) {
        best.team2 = best.team1 === ev.homeName ? ev.awayName : ev.homeName
      }
    }
    const flipped = best.team1 === ev.awayName || best.team2 === ev.homeName
    const pick = (h, a) => (flipped ? [a, h] : [h, a])
    const pair = (h, a) => (h != null && a != null ? pick(h, a) : null)

    best.espnId = ev.id || null
    const atHalftime = /HALFTIME/i.test(ev.statusName)

    if (ev.state === 'post') {
      best.liveState = 'ft'
      const total = pair(ev.homeScore, ev.awayScore)
      const ht = pair(ev.homeHt, ev.awayHt)
      const ninety = pair(ev.home90, ev.away90)
      const pens = pair(ev.homeShootout, ev.awayShootout)
      const wentExtra = ninety && total && ninety[0] + ninety[1] !== total[0] + total[1]
      const score = {}
      if (ht) score.ht = ht
      if (wentExtra) {
        score.ft = ninety
        score.et = total
      } else if (total) {
        score.ft = total
      }
      if (pens && (pens[0] || pens[1])) score.p = pens
      if (score.ft && !best.score?.ft) {
        best.score = { ...score }
        if (!best.goals1?.length && !best.goals2?.length) {
          const [gh, ga] = ev.goals
          ;[best.goals1, best.goals2] = flipped ? [ga, gh] : [gh, ga]
        }
      }
    } else if (ev.state === 'in') {
      if (best.score?.ft) continue // feed already finalized it
      if (atHalftime) {
        best.liveState = 'ht'
        const ht = pair(ev.homeScore, ev.awayScore)
        if (ht) best.score = { ht }
        const [gh, ga] = ev.goals
        ;[best.goals1, best.goals2] = flipped ? [ga, gh] : [gh, ga]
      } else if (ev.period <= 1) {
        best.liveState = '1h'
      } else if (ev.period === 2) {
        best.liveState = '2h'
        const ht = pair(ev.homeHt, ev.awayHt)
        if (ht && !best.score?.ht) best.score = { ht }
      } else {
        best.liveState = ev.period >= 5 ? 'pens' : 'et'
        const ht = pair(ev.homeHt, ev.awayHt)
        const ninety = pair(ev.home90, ev.away90)
        const score = {}
        if (ht) score.ht = ht
        if (ninety) score.ft = ninety
        if (score.ft) best.score = score
      }
    }
  }
  return matches
}

// ---- match facts (summary endpoint) ----

const factsCache = new Map()

export function parseSummary(json, match) {
  const facts = { stats: [], info: [], header: null }
  const box = json?.boxscore?.teams
  if (Array.isArray(box) && box.length === 2) {
    let [a, b] = box
    // align columns with the card's team1/team2 when we can
    if (canonName(b.team?.displayName) === match?.team1) [a, b] = [b, a]
    facts.teamA = canonName(a.team?.displayName) ?? a.team?.displayName ?? ''
    facts.teamB = canonName(b.team?.displayName) ?? b.team?.displayName ?? ''
    const bStats = new Map(
      (b.statistics ?? []).map((s) => [s.name ?? s.label, s.displayValue ?? '–']),
    )
    for (const s of a.statistics ?? []) {
      facts.stats.push({
        label: s.label ?? s.name,
        a: s.displayValue ?? '–',
        b: bStats.get(s.name ?? s.label) ?? '–',
      })
    }
  }
  const gi = json?.gameInfo
  const venueName = gi?.venue?.fullName
  const city = gi?.venue?.address?.city
  if (venueName) facts.info.push(['Venue', city ? `${venueName}, ${city}` : venueName])
  if (gi?.attendance) facts.info.push(['Attendance', Number(gi.attendance).toLocaleString()])
  const officials = gi?.officials ?? json?.officials
  const ref = officials?.find?.((o) => /referee/i.test(o.position?.displayName ?? ''))
  if (ref?.fullName ?? ref?.displayName) facts.info.push(['Referee', ref.fullName ?? ref.displayName])
  return facts
}

export async function fetchMatchFacts(match) {
  if (!match?.espnId) return null
  if (factsCache.has(match.espnId)) return factsCache.get(match.espnId)
  const res = await fetch(summaryUrl(match.espnId))
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const facts = parseSummary(await res.json(), match)
  // stats keep changing during a match; only cache once it's over
  if (match.score?.ft || match.liveState === 'ft') factsCache.set(match.espnId, facts)
  return facts
}

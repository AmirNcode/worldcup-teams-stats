// OpenF1 (api.openf1.org) — free, keyless, CORS-enabled HISTORICAL data (2023+).
// We use it only for post-session depth that Jolpica doesn't carry: pit stops and
// tyre strategy on a completed race. (OpenF1's true real-time feed during a
// session is a paid tier and is deliberately NOT used — the app stays free and
// backend-less.) Fetched lazily per race and fail-soft: if anything is missing,
// the race page still renders Jolpica's classification.
//
// Parsers are pure and defensive. OpenF1 keys data by `driver_number`; the race
// page maps that to our Jolpica driverId via the 3-letter acronym/code.

const BASE = 'https://api.openf1.org/v1'

export const raceSessionsUrl = (year) => `${BASE}/sessions?year=${year}&session_name=Race`
export const driversUrl = (sessionKey) => `${BASE}/drivers?session_key=${sessionKey}`
export const pitUrl = (sessionKey) => `${BASE}/pit?session_key=${sessionKey}`
export const stintsUrl = (sessionKey) => `${BASE}/stints?session_key=${sessionKey}`

export function parseSessions(json) {
  const arr = Array.isArray(json) ? json : []
  return arr.map((s) => ({
    sessionKey: s.session_key,
    date: (s.date_start ?? '').slice(0, 10),
    country: s.country_name ?? null,
    circuit: s.circuit_short_name ?? null,
  }))
}

// The race session held on a given calendar date (the robust join between feeds,
// since round numbering can differ between Jolpica and OpenF1).
export function raceSessionKeyForDate(sessions, date) {
  return sessions.find((s) => s.date === date)?.sessionKey ?? null
}

export function parseDrivers(json) {
  const arr = Array.isArray(json) ? json : []
  return arr.map((d) => ({
    number: d.driver_number,
    name: d.full_name ?? null,
    acronym: d.name_acronym ?? null,
    teamName: d.team_name ?? null,
    colour: d.team_colour ? `#${d.team_colour}` : null,
  }))
}

// driver_number -> { stops, best } (best = shortest stationary/pit duration, seconds)
export function parsePits(json) {
  const arr = Array.isArray(json) ? json : []
  const by = {}
  for (const p of arr) {
    const n = p.driver_number
    if (n == null) continue
    if (!by[n]) by[n] = { stops: 0, best: null }
    by[n].stops += 1
    const dur = p.pit_duration ?? null
    if (dur != null && (by[n].best == null || dur < by[n].best)) by[n].best = dur
  }
  return by
}

// driver_number -> [compound, ...] in stint order, consecutive duplicates merged
// (OpenF1 sometimes splits one tyre run across several stint rows).
export function parseStints(json) {
  const arr = Array.isArray(json) ? json : []
  const ordered = arr.slice().sort((a, b) => (a.stint_number ?? 0) - (b.stint_number ?? 0))
  const by = {}
  for (const s of ordered) {
    const n = s.driver_number
    if (n == null || !s.compound) continue
    if (!by[n]) by[n] = []
    if (by[n][by[n].length - 1] !== s.compound) by[n].push(s.compound)
  }
  return by
}

// Build driver_number -> Jolpica driverId using the shared 3-letter code, so
// OpenF1's pit/stint data can be attached to the Jolpica classification.
export function numberToDriverId(openf1Drivers, modelDrivers) {
  const byCode = {}
  for (const d of modelDrivers) if (d.code) byCode[d.code.toUpperCase()] = d.driverId
  const map = {}
  for (const od of openf1Drivers) {
    const id = od.acronym ? byCode[od.acronym.toUpperCase()] : null
    if (id != null) map[od.number] = id
  }
  return map
}

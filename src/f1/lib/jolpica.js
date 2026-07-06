// Jolpica-F1 (api.jolpi.ca) is a free, keyless, CORS-enabled drop-in successor
// to the Ergast API. We use it for the structured layer: schedule, standings,
// results, drivers, constructors, circuits. Parsing is defensive — a bad payload
// must never crash the UI (the provider falls back to the bundled snapshot).
//
// These parsers are pure and shared by both the offline-snapshot generator
// (scripts/generate-f1.mjs) and the live F1DataProvider, so the snapshot and the
// live data always have the same normalized shape.

const BASE = 'https://api.jolpi.ca/ergast/f1'

// `current` is the Ergast keyword for the ongoing season, so this keeps working
// across seasons without a code change.
export const scheduleUrl = (season = 'current') => `${BASE}/${season}.json`
export const driverStandingsUrl = (season = 'current') => `${BASE}/${season}/driverStandings.json`
export const constructorStandingsUrl = (season = 'current') => `${BASE}/${season}/constructorStandings.json`
// Jolpica caps `limit` at 100 result rows (~4.5 races), so a season's results
// span several pages — request page-by-page via `offset`.
export const resultsUrl = (season = 'current', offset = 0) =>
  `${BASE}/${season}/results.json?limit=100&offset=${offset}`

// Fetch every results page and stitch them into one byRound map (parseResults
// shape). A race can be split across a page boundary, so rows are merged per
// round before deriving winner/podium. Pages are fetched sequentially —
// Jolpica rate-limits bursts. `getJson` is injected so this works from both
// the browser provider and the Node snapshot generator.
export async function fetchAllResults(getJson, season = 'current') {
  const MAX_PAGES = 12 // safety bound; a full season is ~500 rows (5 pages)
  const races = []
  let offset = 0
  let total = Infinity
  for (let page = 0; page < MAX_PAGES && offset < total; page++) {
    const mr = (await getJson(resultsUrl(season, offset)))?.MRData
    if (!mr) break
    total = Number(mr.total ?? 0)
    for (const race of mr.RaceTable?.Races ?? []) {
      const prev = races.find((x) => x.round === race.round)
      if (prev) prev.Results = [...(prev.Results ?? []), ...(race.Results ?? [])]
      else races.push({ ...race, Results: [...(race.Results ?? [])] })
    }
    offset += Number(mr.limit ?? 0) || 100
  }
  return parseResults({ MRData: { RaceTable: { Races: races } } })
}

const num = (v) => (v == null || v === '' ? null : Number(v))

export function parseSchedule(json) {
  const races = json?.MRData?.RaceTable?.Races ?? []
  return races.map((r) => ({
    round: Number(r.round),
    name: r.raceName,
    circuitId: r.Circuit?.circuitId ?? null,
    circuitName: r.Circuit?.circuitName ?? null,
    locality: r.Circuit?.Location?.locality ?? null,
    country: r.Circuit?.Location?.country ?? null,
    // date + UTC time → a full ISO instant rendered in the visitor's local zone
    start: r.time ? `${r.date}T${r.time}` : r.date,
    date: r.date,
  }))
}

export function parseDriverStandings(json) {
  const list = json?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? []
  return list.map((x) => {
    // a driver who has changed teams mid-season lists multiple Constructors;
    // the last entry is the current one
    const team = x.Constructors?.[x.Constructors.length - 1]
    return {
      position: num(x.position),
      points: num(x.points) ?? 0,
      wins: num(x.wins) ?? 0,
      driverId: x.Driver?.driverId,
      code: x.Driver?.code ?? null,
      number: x.Driver?.permanentNumber ?? null,
      given: x.Driver?.givenName ?? '',
      family: x.Driver?.familyName ?? '',
      name: `${x.Driver?.givenName ?? ''} ${x.Driver?.familyName ?? ''}`.trim(),
      nationality: x.Driver?.nationality ?? null,
      constructorId: team?.constructorId ?? null,
      constructorName: team?.name ?? null,
    }
  })
}

export function parseConstructorStandings(json) {
  const list = json?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? []
  return list.map((x) => ({
    position: num(x.position),
    points: num(x.points) ?? 0,
    wins: num(x.wins) ?? 0,
    constructorId: x.Constructor?.constructorId,
    name: x.Constructor?.name,
    nationality: x.Constructor?.nationality ?? null,
  }))
}

// → { [round]: { results, winnerId, podium, poleId, fastestLapDriverId } }
export function parseResults(json) {
  const races = json?.MRData?.RaceTable?.Races ?? []
  const byRound = {}
  for (const r of races) {
    const rows = (r.Results ?? []).map((res) => ({
      pos: num(res.position),
      driverId: res.Driver?.driverId,
      constructorId: res.Constructor?.constructorId,
      points: num(res.points) ?? 0,
      grid: num(res.grid),
      status: res.status ?? null,
      // total race time (winner) or gap to leader ("+5.123"); null for a DNF
      time: res.Time?.time ?? null,
      // the driver's own fastest lap in the race, e.g. "1:22.670"
      fastestLap: res.FastestLap?.Time?.time ?? null,
    }))
    const pole = (r.Results ?? []).find((res) => num(res.grid) === 1)
    const fl = (r.Results ?? []).find((res) => res.FastestLap?.rank === '1')
    byRound[Number(r.round)] = {
      results: rows,
      winnerId: rows[0]?.driverId ?? null,
      podium: rows.slice(0, 3).map((x) => x.driverId),
      poleId: pole?.Driver?.driverId ?? null,
      fastestLapDriverId: fl?.Driver?.driverId ?? null,
    }
  }
  return byRound
}

// Combine the four feeds into the normalized model the app consumes. Each round
// merges its schedule entry with its result (when the race is done).
export function normalize({ season, schedule, driverStandings, constructorStandings, results }) {
  const rounds = (schedule ?? []).map((r) => {
    const res = results?.[r.round]
    return {
      ...r,
      done: !!res,
      winnerId: res?.winnerId ?? null,
      podium: res?.podium ?? null,
      poleId: res?.poleId ?? null,
      fastestLapDriverId: res?.fastestLapDriverId ?? null,
      results: res?.results ?? null,
    }
  })
  return {
    season: season ?? null,
    rounds,
    drivers: (driverStandings ?? []).slice().sort((a, b) => (a.position ?? 99) - (b.position ?? 99)),
    constructors: (constructorStandings ?? []).slice().sort((a, b) => (a.position ?? 99) - (b.position ?? 99)),
  }
}

// Pure selectors over the normalized F1 model (from jolpica.js / the snapshot),
// merged with curated reference (team colors, circuit specs, flags) that the
// feed doesn't carry. Pages call these with the model from useF1Data().
import { constructorInfo, fallbackAbbr } from '../data/constructors'
import { circuitInfo } from '../data/circuits'
import { flagFor, countryFlag } from '../data/flags'

const withFlag = (d) => (d ? { ...d, flag: flagFor(d.nationality) } : null)

export const driverById = (model, driverId) =>
  withFlag(model.drivers.find((x) => x.driverId === driverId))

export const driversByPoints = (model) => model.drivers.map(withFlag)

export function constructorById(model, constructorId) {
  const c = model.constructors.find((x) => x.constructorId === constructorId)
  if (!c) return null
  const info = constructorInfo[constructorId] ?? {}
  return {
    ...c,
    abbr: info.abbr ?? fallbackAbbr(c.name),
    color: info.color ?? '#888888',
    base: info.base ?? null,
    powerUnit: info.powerUnit ?? null,
    championships: info.championships ?? null,
    facts: info.facts ?? [],
  }
}

export const constructorsByPoints = (model) =>
  model.constructors.map((c) => constructorById(model, c.constructorId))

export const teamDrivers = (model, constructorId) =>
  model.drivers
    .filter((d) => d.constructorId === constructorId)
    .map(withFlag)
    .sort((a, b) => b.points - a.points)

export const rounds = (model) => model.rounds
export const roundByNumber = (model, n) => model.rounds.find((r) => r.round === Number(n))
export const doneRounds = (model) => model.rounds.filter((r) => r.done)
export const nextRound = (model) => model.rounds.find((r) => r.status !== 'done' && !r.done) ?? null

// A driver's finishes across completed rounds, most recent first. pos is null
// when the driver did not appear in that round's classified results.
export function driverResults(model, driverId) {
  return doneRounds(model)
    .slice()
    .reverse()
    .map((r) => {
      const row = r.results?.find((x) => x.driverId === driverId)
      return { round: r.round, name: r.name, circuitId: r.circuitId, pos: row?.pos ?? null }
    })
}

export function circuitById(model, circuitId) {
  const r = model.rounds.find((x) => x.circuitId === circuitId)
  if (!r) return null
  const info = circuitInfo[circuitId] ?? {}
  return {
    circuitId,
    name: r.circuitName,
    locality: r.locality,
    country: r.country,
    flag: countryFlag(r.country),
    round: r.round,
    lengthKm: info.lengthKm ?? null,
    laps: info.laps ?? null,
    lapRecord: info.lapRecord ?? null,
    facts: info.facts ?? [],
  }
}

// Unique circuits on this season's calendar, in round order.
export function circuitsOnCalendar(model) {
  const seen = new Set()
  const out = []
  for (const r of model.rounds) {
    if (!r.circuitId || seen.has(r.circuitId)) continue
    seen.add(r.circuitId)
    out.push(circuitById(model, r.circuitId))
  }
  return out
}

export const doneRoundAtCircuit = (model, circuitId) =>
  doneRounds(model)
    .reverse()
    .find((r) => r.circuitId === circuitId)

const topOf = (counts) => {
  let best = null
  for (const [id, n] of Object.entries(counts)) if (!best || n > best.n) best = { id, n }
  return best
}

// A "finished" classification (incl. lapped runners) vs a DNF/DNS retirement.
const isFinish = (status) => status === 'Finished' || /^\+\d+\s+Lap/.test(status ?? '')

// Season superlatives derived purely from completed rounds — the one view that
// is NOT a re-cut of the standings. Returns leaders (with driverId/teamId + count)
// for the Stats page to label.
export function seasonStats(model) {
  const done = doneRounds(model)
  const poles = {}
  const podiums = {}
  const fastest = {}
  const dnfs = {}
  let bestClimb = null // { gained, driverId, round, name }
  for (const r of done) {
    if (r.poleId) poles[r.poleId] = (poles[r.poleId] ?? 0) + 1
    if (r.fastestLapDriverId) fastest[r.fastestLapDriverId] = (fastest[r.fastestLapDriverId] ?? 0) + 1
    for (const row of r.results ?? []) {
      if (row.pos != null && row.pos <= 3) podiums[row.driverId] = (podiums[row.driverId] ?? 0) + 1
      if (!isFinish(row.status)) dnfs[row.driverId] = (dnfs[row.driverId] ?? 0) + 1
      if (row.grid != null && row.grid > 0 && row.pos != null) {
        const gained = row.grid - row.pos
        if (gained > 0 && (!bestClimb || gained > bestClimb.gained)) {
          bestClimb = { gained, driverId: row.driverId, round: r.round, name: r.name }
        }
      }
    }
  }
  return {
    racesDone: done.length,
    racesTotal: model.rounds.length,
    leader: model.drivers[0] ?? null,
    topConstructor: model.constructors[0] ?? null,
    mostWins: [...model.drivers].sort((a, b) => b.wins - a.wins)[0] ?? null,
    mostPoles: topOf(poles),
    mostPodiums: topOf(podiums),
    mostFastestLaps: topOf(fastest),
    mostDnfs: topOf(dnfs),
    bestClimb,
  }
}

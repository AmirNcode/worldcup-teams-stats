// Regenerate src/f1/data/snapshot.json from Jolpica-F1 — the bundled offline
// floor for the Formula 1 section, so the app always renders even when a live
// fetch fails or hasn't completed yet. Uses the same parsers as the live
// provider (src/f1/lib/jolpica.js) so snapshot and live data share one shape.
// Run: npm run update-f1-data   (optionally: npm run update-f1-data 2025)
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  scheduleUrl,
  driverStandingsUrl,
  constructorStandingsUrl,
  parseSchedule,
  parseDriverStandings,
  parseConstructorStandings,
  fetchAllResults,
  normalize,
} from '../src/f1/lib/jolpica.js'

const SEASON = process.argv[2] || 'current'

async function getJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

async function main() {
  const [sch, ds, cs, results] = await Promise.all([
    getJson(scheduleUrl(SEASON)),
    getJson(driverStandingsUrl(SEASON)),
    getJson(constructorStandingsUrl(SEASON)),
    fetchAllResults(getJson, SEASON),
  ])
  const season = sch?.MRData?.RaceTable?.season ?? null
  const model = normalize({
    season,
    schedule: parseSchedule(sch),
    driverStandings: parseDriverStandings(ds),
    constructorStandings: parseConstructorStandings(cs),
    results,
  })
  const out = { generatedAt: new Date().toISOString(), source: 'jolpica', ...model }
  const path = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'f1', 'data', 'snapshot.json')
  writeFileSync(path, JSON.stringify(out, null, 2) + '\n')
  const done = model.rounds.filter((r) => r.done).length
  console.log(
    `F1 snapshot: season ${season}, ${model.rounds.length} rounds (${done} done), ` +
      `${model.drivers.length} drivers, ${model.constructors.length} constructors -> ${path}`,
  )
}

main().catch((e) => {
  console.error('generate-f1 failed:', e.message)
  process.exit(1)
})

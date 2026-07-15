// Regenerate src/leagues/data/snapshot.json from ESPN — the bundled offline
// floor for the Leagues section, so every league renders even when a live
// fetch fails or hasn't completed yet. Uses the same parsers/fetch helpers as
// the live provider (src/leagues/lib/espn.js) so snapshot and live data share
// one shape. Run: npm run update-leagues-data
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { LEAGUES } from '../src/leagues/lib/leagues.js'
import { fetchLeagueStandings, fetchLeagueMatches, fetchLeagueLeaders, parseTeams, teamsUrl } from '../src/leagues/lib/espn.js'

async function getJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

async function main() {
  const leagues = {}
  // sequential: five leagues × ~3 calls, be gentle with the unofficial API
  for (const lg of LEAGUES) {
    const standings = await fetchLeagueStandings(getJson, lg.espn)
    const matches = await fetchLeagueMatches(getJson, lg.espn)
    const teams = parseTeams(await getJson(teamsUrl(lg.espn)))
    const leaders = await fetchLeagueLeaders(getJson, lg.espn)
    leagues[lg.id] = { standings, matches, teams, leaders }
    console.log(
      `${lg.name}: ${standings.rows.length} table rows, ${teams.length} teams (${standings.season}), ` +
        `${matches.length} matches, top scorer ${leaders.goals[0]?.name ?? '—'} (${leaders.goals[0]?.value ?? 0})`,
    )
  }
  const out = { generatedAt: new Date().toISOString(), source: 'espn', leagues }
  const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'leagues', 'data')
  mkdirSync(dir, { recursive: true })
  const path = join(dir, 'snapshot.json')
  writeFileSync(path, JSON.stringify(out, null, 2) + '\n')
  console.log(`-> ${path}`)
}

main().catch((e) => {
  console.error('generate-leagues failed:', e.message)
  process.exit(1)
})

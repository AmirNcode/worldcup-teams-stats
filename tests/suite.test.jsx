// Full test suite: pure-logic units (standings, scorers, formats, ESPN
// parsing/merging) plus a server-render smoke test of every route.
// Run with: npm test
import React from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import schedule from '../src/data/schedule.json'
import { computeGroups, thirdPlaceRace, teamTournamentRecord, tournamentRankings } from '../src/lib/standings.js'
import { goldenBoot, tournamentTotals } from '../src/lib/scorers.js'
import { placeholderLabel, scoreline, dayKey } from '../src/lib/format.js'
import {
  canonName,
  parseScoreboard,
  applyEspn,
  parseSummary,
  parseLineups,
  bucketPosition,
} from '../src/lib/espn.js'
import {
  DataProvider,
  matchStatus,
  finalScore,
  isInPlay,
  nextRefreshDelay,
} from '../src/lib/data.jsx'
import App from '../src/App.jsx'
import AdSlot from '../src/components/AdSlot.jsx'
import { F1DataProvider } from '../src/f1/lib/data.jsx'
import { LeaguesDataProvider } from '../src/leagues/lib/data.jsx'
import {
  parseSchedule,
  parseDriverStandings,
  parseConstructorStandings,
  parseResults,
  fetchAllResults,
  normalize,
} from '../src/f1/lib/jolpica.js'
import {
  parseSessions,
  raceSessionKeyForDate,
  parseDrivers,
  parsePits,
  parseStints,
  numberToDriverId,
} from '../src/f1/lib/openf1.js'
import { seasonStats } from '../src/f1/lib/select.js'
import { LEAGUES, leagueById, DEFAULT_LEAGUE } from '../src/leagues/lib/leagues.js'
import {
  parseLeagueStandings,
  parseLeagueScoreboard,
  fetchLeagueStandings,
  fetchLeagueMatches,
  parseTeams,
  parseRoster,
  parseTeamSchedule,
  fetchTeamBundle,
} from '../src/leagues/lib/espn.js'
import {
  analyticsEnabled,
  normalizeRoute,
  track,
  trackPageview,
} from '../src/lib/analytics.js'

let fails = 0
const check = (label, got, want) => {
  if (JSON.stringify(got) === JSON.stringify(want)) {
    console.log(`ok   ${label}`)
  } else {
    fails++
    console.log(`FAIL ${label}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`)
  }
}

// ---------- standings / scorers / format ----------
{
  const M = (t1, t2, g, ft, ht, goals1 = [], goals2 = []) => ({
    stage: 'group', group: g, team1: t1, team2: t2,
    score: ft ? { ft, ht } : null, goals1, goals2,
    kickoff: '2026-06-11T13:00:00-06:00',
  })
  const ms = [
    M('Mexico', 'South Africa', 'A', [2, 1], [1, 1],
      [{ name: 'Raúl Jiménez', minute: 30, penalty: true }, { name: 'Santiago Giménez', minute: 60 }],
      [{ name: 'Percy Tau', minute: 10 }]),
    M('South Korea', 'Czech Republic', 'A', [1, 1], [0, 0],
      [{ name: 'Son Heung-min', minute: 70 }], [{ name: 'Patrik Schick', minute: 80 }]),
    M('Mexico', 'South Korea', 'A', [0, 0], [0, 0]),
    M('Czech Republic', 'South Africa', 'A', [3, 0], [2, 0],
      [{ name: 'Patrik Schick', minute: 5 }, { name: 'Patrik Schick', minute: 25 },
       { name: 'OG Guy', minute: 50, owngoal: true }]),
  ]
  const g = computeGroups(ms)
  check('group order pts/gd', g.A.map((r) => r.team),
    ['Czech Republic', 'Mexico', 'South Korea', 'South Africa'])
  check('points', g.A.map((r) => r.pts), [4, 4, 2, 0])
  const boot = goldenBoot(ms)
  check('boot leader', [boot[0].name, boot[0].goals], ['Patrik Schick', 3])
  check('own goal excluded', boot.some((s) => s.name === 'OG Guy'), false)
  check('totals', tournamentTotals(ms), { played: 4, goals: 8 })
  check('record', teamTournamentRecord(ms, 'Mexico'), { mp: 2, w: 1, d: 1, l: 0, gf: 2, ga: 1 })
  // head-to-head tiebreak among fully tied pair
  const tied = [M('X', 'Y', 'Z', [1, 0]), M('Y', 'W2', 'Z', [2, 1]), M('X', 'W2', 'Z', [0, 1])]
  check('h2h tiebreak', computeGroups(tied).Z.map((r) => r.team), ['Y', 'W2', 'X'])
  check('label 1A', placeholderLabel('1A'), 'Winner Group A')
  check('label 3rd', placeholderLabel('3A/B/C/D/F'), 'Best 3rd (A/B/C/D/F)')
  check('label W74', placeholderLabel('W74'), 'Winner of Match 74')
  check('scoreline pens', scoreline({ ft: [2, 2], et: [3, 3], p: [4, 2] }), '3 – 3 (4–2 pens)')
  check('dayKey local', typeof dayKey('2026-06-11T13:00:00-06:00'), 'string')
}

// ---------- third place race ----------
{
  const fixtures = []
  const groups = 'ABCDEFGHIJKL'.split('')
  for (const grp of groups) {
    // 3 teams so each group has a 3rd place. Everywhere the 3rd-placed team
    // ends on 0 pts, except group A where a draw gives it 1 pt (and the
    // h2h-then-name tiebreak puts A3 third behind A2).
    fixtures.push(
      { stage: 'group', group: grp, team1: `${grp}1`, team2: `${grp}2`, kickoff: '2026-06-11T13:00:00Z', score: { ft: [1, 0] } },
      { stage: 'group', group: grp, team1: `${grp}2`, team2: `${grp}3`, kickoff: '2026-06-12T13:00:00Z', score: { ft: grp === 'A' ? [0, 0] : [1, 0] } },
      { stage: 'group', group: grp, team1: `${grp}1`, team2: `${grp}3`, kickoff: '2026-06-13T13:00:00Z', score: { ft: [1, 0] } },
    )
  }
  const race = thirdPlaceRace(computeGroups(fixtures))
  check('race has 12 teams', race.length, 12)
  check('race leader is A3 on pts', [race[0].team, race[0].pts], ['A3', 1])

  // tournament rankings, group phase complete: 24 group top-two + best 8 thirds
  // sit above the cutoff; the worst 4 thirds (tied on pts/GD/GF, by name) below.
  const ranking = tournamentRankings(fixtures)
  check('rankings cutoff count', ranking.cutoff, 32)
  check('rankings total teams', ranking.ranked.length, 36)
  check('rankings leader by pts then name', [ranking.ranked[0].team, ranking.ranked[0].pts], ['A1', 6])
  check('rankings divider after groups', ranking.dividerLabel, 'Eliminated')
  check('rankings worst thirds below line', ranking.ranked.slice(32).map((r) => r.team), ['I3', 'J3', 'K3', 'L3'])

  // add a knockout result: A1 beat B1 in the Round of 32. A1 advances (ranked by
  // furthest stage, so rises to the top); B1 drops below the cutoff as eliminated.
  const withKo = [...fixtures, {
    stage: 'r32', group: null, team1: 'A1', team2: 'B1',
    score: { ft: [1, 0] }, kickoff: '2026-06-30T13:00:00Z',
  }]
  const ko = tournamentRankings(withKo)
  check('knockout winner leads on stage', [ko.ranked[0].team, ko.ranked[0].stage], ['A1', 1])
  check('knockout winner mp counts ko', ko.ranked[0].mp, 3)
  check('knockout loser drops out', ko.ranked.find((r) => r.team === 'B1').out, true)
  check('knockout cutoff shrinks by one', ko.cutoff, 31)
  check('knockout loser tops the out group', ko.ranked[ko.cutoff].team, 'B1')
}

// ---------- ESPN parsing / merging ----------
check('alias United States', canonName('United States'), 'USA')
check('alias Türkiye', canonName('Türkiye'), 'Turkey')
check('alias Korea Republic', canonName('Korea Republic'), 'South Korea')
check('alias Cabo Verde', canonName('Cabo Verde'), 'Cape Verde')
check("alias Côte d'Ivoire", canonName("Côte d'Ivoire"), 'Ivory Coast')
check('alias unknown', canonName('Narnia'), null)

{
  const matches = schedule.matches.map((m) => ({ ...m }))
  const sb = parseScoreboard({ events: [
    { // halftime, ESPN home/away flipped vs our team1/team2
      id: '731001', date: '2026-06-11T19:00Z',
      status: { type: { state: 'in', name: 'STATUS_HALFTIME' }, period: 1 },
      competitions: [{
        competitors: [
          { homeAway: 'home', team: { id: '20', displayName: 'South Africa' }, score: '0' },
          { homeAway: 'away', team: { id: '21', displayName: 'Mexico' }, score: '1' },
        ],
        details: [{ scoringPlay: true, type: { text: 'Goal' }, clock: { displayValue: "32'" },
          team: { id: '21' }, athletesInvolved: [{ displayName: 'Raúl Jiménez' }] }],
      }],
    },
    { // 2nd half in play, NO linescores (the Korea–Czech regression):
      // HT must be reconstructed from goal minutes, stoppage counts as 45'
      id: '731002', date: '2026-06-13T16:00Z',
      status: { type: { state: 'in', name: 'STATUS_IN_PROGRESS' }, period: 2 },
      competitions: [{
        competitors: [
          { homeAway: 'home', team: { id: '50', displayName: 'Brazil' }, score: '2' },
          { homeAway: 'away', team: { id: '51', displayName: 'Morocco' }, score: '1' },
        ],
        details: [
          { scoringPlay: true, type: { text: 'Goal' }, clock: { displayValue: "21'" }, team: { id: '50' }, athletesInvolved: [{ displayName: 'Vinícius Júnior' }] },
          { scoringPlay: true, type: { text: 'Goal' }, clock: { displayValue: "45'+3'" }, team: { id: '51' }, athletesInvolved: [{ displayName: 'Youssef En-Nesyri' }] },
          { scoringPlay: true, type: { text: 'Goal' }, clock: { displayValue: "58'" }, team: { id: '50' }, athletesInvolved: [{ displayName: 'Rodrygo' }] },
        ],
      }],
    },
    { // finished after ET + pens, with linescores
      id: '731003', date: '2026-06-12T02:00Z',
      status: { type: { state: 'post', name: 'STATUS_FINAL_PEN' }, period: 5 },
      competitions: [{
        competitors: [
          { homeAway: 'home', team: { id: '30', displayName: 'Korea Republic' }, score: '2', shootoutScore: 4,
            linescores: [{ value: 0 }, { value: 1 }, { value: 1 }, { value: 0 }] },
          { homeAway: 'away', team: { id: '31', displayName: 'Czechia' }, score: '2', shootoutScore: 3,
            linescores: [{ value: 1 }, { value: 0 }, { value: 0 }, { value: 1 }] },
        ],
        details: [
          { scoringPlay: true, type: { text: 'Goal - Header' }, clock: { displayValue: "55'" }, team: { id: '30' }, athletesInvolved: [{ displayName: 'Son Heung-min' }] },
          { scoringPlay: true, type: { text: 'Own Goal' }, clock: { displayValue: "98'" }, team: { id: '30' }, athletesInvolved: [{ displayName: 'Some Defender' }] },
          { scoringPlay: true, type: { text: 'Goal' }, clock: { displayValue: "12'" }, team: { id: '31' }, athletesInvolved: [{ displayName: 'Patrik Schick' }] },
          { scoringPlay: true, type: { text: 'Penalty - Scored' }, clock: { displayValue: "105'+1'" }, team: { id: '31' }, athletesInvolved: [{ displayName: 'Patrik Schick' }] },
          { scoringPlay: true, type: { text: 'Shootout Penalty - Scored' }, clock: { displayValue: "120'" }, team: { id: '30' }, athletesInvolved: [{ displayName: 'Nope' }] },
        ],
      }],
    },
  ]})
  applyEspn(matches, sb)

  const mex = matches.find((m) => m.team1 === 'Mexico' && m.team2 === 'South Africa')
  check('HT score oriented to team1', mex.score, { ht: [1, 0] })
  check('HT status', matchStatus(mex, new Date('2026-06-11T20:00Z')), 'ht')
  check('goal credited to team1', mex.goals1?.[0]?.name, 'Raúl Jiménez')

  const bra = matches.find((m) => m.team1 === 'Brazil' && m.team2 === 'Morocco')
  check('2h derived HT (no linescores)', bra.score, { ht: [1, 1] })
  check('2h status', matchStatus(bra, new Date('2026-06-13T17:00Z')), '2h')

  const kor = matches.find((m) => m.team1 === 'South Korea' && m.team2 === 'Czech Republic')
  check('ET split 90/et/pens', [kor.score?.ft, kor.score?.et, kor.score?.p], [[1, 1], [2, 2], [4, 3]])
  check('shootout excluded from goals', kor.goals1?.map((g) => g.name), ['Son Heung-min', 'Some Defender'])
  check('finalScore prefers et', finalScore(kor), [2, 2])
  check('ft status', matchStatus(kor), 'ft')

  // knockout placeholder adoption + ET final derived without linescores
  const fin = matches.find((m) => m.stage === 'final')
  applyEspn(matches, parseScoreboard({ events: [{
    id: '99', date: fin.kickoff,
    status: { type: { state: 'post', name: 'STATUS_FINAL_AET' }, period: 4 },
    competitions: [{
      competitors: [
        { homeAway: 'home', team: { id: '60', displayName: 'Argentina' }, score: '2' },
        { homeAway: 'away', team: { id: '61', displayName: 'France' }, score: '1' },
      ],
      details: [
        { scoringPlay: true, type: { text: 'Goal' }, clock: { displayValue: "30'" }, team: { id: '60' }, athletesInvolved: [{ displayName: 'Lionel Messi' }] },
        { scoringPlay: true, type: { text: 'Goal' }, clock: { displayValue: "80'" }, team: { id: '61' }, athletesInvolved: [{ displayName: 'Kylian Mbappé' }] },
        { scoringPlay: true, type: { text: 'Goal' }, clock: { displayValue: "112'" }, team: { id: '60' }, athletesInvolved: [{ displayName: 'Lionel Messi' }] },
      ],
    }],
  }]}))
  check('final placeholders adopted', [fin.team1, fin.team2], ['Argentina', 'France'])
  check('final derived 90/et/ht', [fin.score?.ft, fin.score?.et, fin.score?.ht], [[1, 1], [2, 1], [1, 0]])

  // ---------- lineups ----------
  check('bucket GK', bucketPosition({ abbreviation: 'G' }), 'GK')
  check('bucket DEF', bucketPosition({ abbreviation: 'D' }), 'DEF')
  check('bucket MID', bucketPosition({ abbreviation: 'M' }), 'MID')
  check('bucket FWD', bucketPosition({ abbreviation: 'F' }), 'FWD')
  check('bucket by name winger', bucketPosition({ abbreviation: 'X', name: 'Left Winger' }), 'FWD')
  const lineups = parseLineups({
    rosters: [
      {
        team: { displayName: 'Argentina' },
        roster: [
          { starter: true, jersey: '10', captain: true, athlete: { displayName: 'Lionel Messi' }, position: { abbreviation: 'F' } },
          { starter: true, jersey: '23', athlete: { displayName: 'Emiliano Martínez' }, position: { abbreviation: 'G' } },
          { starter: true, jersey: '13', athlete: { displayName: 'Cristian Romero' }, position: { abbreviation: 'D' } },
          { starter: false, jersey: '9', athlete: { displayName: 'Julián Álvarez' }, position: { abbreviation: 'F' } },
          { starter: false, jersey: '2', athlete: { displayName: 'Some Sub' }, position: { abbreviation: 'D' } },
        ],
      },
      { team: { displayName: 'France' }, roster: [
        { starter: true, jersey: '10', athlete: { displayName: 'Kylian Mbappé' }, position: { abbreviation: 'F' } },
      ]},
    ],
  })
  check('lineup keyed by canonical team', Object.keys(lineups).sort(), ['Argentina', 'France'])
  check('starters count', lineups.Argentina.starters.length, 3)
  check('bench count', lineups.Argentina.bench.length, 2)
  check('captain flagged', lineups.Argentina.starters.find((p) => p.captain)?.name, 'Lionel Messi')
  check('starters sorted by number', lineups.Argentina.starters.map((p) => p.number), ['10', '13', '23'])
  check('bench sorted by number', lineups.Argentina.bench.map((p) => p.number), ['2', '9'])
  check('position grouped', lineups.Argentina.starters.find((p) => p.number === '23').group, 'GK')

  const facts = parseSummary({
    boxscore: { teams: [
      { team: { displayName: 'South Africa' }, statistics: [
        { name: 'possessionPct', label: 'Possession', displayValue: '41%' }] },
      { team: { displayName: 'Mexico' }, statistics: [
        { name: 'possessionPct', label: 'Possession', displayValue: '59%' }] },
    ]},
    gameInfo: { attendance: 87523, venue: { fullName: 'Estadio Azteca', address: { city: 'Mexico City' } } },
  }, mex)
  check('facts aligned to team1', [facts.teamA, facts.stats[0].a], ['Mexico', '59%'])
  check('facts attendance', facts.info[1], ['Attendance', '87,523'])
}

// ---------- live (in-play) updates ----------
{
  const matches = schedule.matches.map((m) => ({ ...m }))
  const live = parseScoreboard({
    events: [
      {
        // Mexico 1-0 South Africa, 32' of the first half (ESPN home/away flipped)
        id: 'L1', date: '2026-06-11T19:30Z',
        status: { type: { state: 'in', name: 'STATUS_FIRST_HALF' }, period: 1, displayClock: "32'" },
        competitions: [{
          competitors: [
            { homeAway: 'home', team: { id: '20', displayName: 'South Africa' }, score: '0' },
            { homeAway: 'away', team: { id: '21', displayName: 'Mexico' }, score: '1' },
          ],
          details: [{ scoringPlay: true, type: { text: 'Goal' }, clock: { displayValue: "32'" }, team: { id: '21' }, athletesInvolved: [{ displayName: 'Raúl Jiménez' }] }],
        }],
      },
    ],
  })
  applyEspn(matches, live)
  const mex = matches.find((m) => m.team1 === 'Mexico' && m.team2 === 'South Africa')
  check('live snapshot score (oriented)', mex.live?.score, [1, 0])
  check('live clock', mex.live?.clock, "32'")
  check('live state 1h', matchStatus(mex), '1h')
  check('isInPlay true', isInPlay(matchStatus(mex)), true)
  check('1st half does NOT set official ft', mex.score?.ft ?? null, null)
  check('live goal credited to team1', mex.goals1?.[0]?.name, 'Raúl Jiménez')
  // standings must ignore an in-progress match (no ft yet)
  const g = computeGroups(matches)
  check('live match not counted in standings', g.A.find((r) => r.team === 'Mexico').mp, 0)
  // golden boot DOES reflect live goals
  check('live goal in golden boot', goldenBoot(matches)[0]?.name, 'Raúl Jiménez')

  // adaptive polling: fast when live, gentle otherwise
  const idle = schedule.matches.map((m) => ({ ...m })) // untouched -> all upcoming/far
  const farFuture = new Date('2027-01-01T00:00:00Z')
  check('idle poll is gentle', nextRefreshDelay(idle, farFuture) >= 60000, true)
  check('live poll is fast', nextRefreshDelay(matches, new Date('2026-06-11T19:30Z')) <= 30000, true)
}

// ---------- Jolpica (F1) parsing / normalize ----------
{
  const sched = parseSchedule({ MRData: { RaceTable: { Races: [
    { round: '1', raceName: 'Australian Grand Prix', date: '2026-03-08', time: '04:00:00Z',
      Circuit: { circuitId: 'albert_park', circuitName: 'Albert Park', Location: { locality: 'Melbourne', country: 'Australia' } } },
  ] } } })
  check('f1 schedule parsed', [sched[0].round, sched[0].circuitId, sched[0].start],
    [1, 'albert_park', '2026-03-08T04:00:00Z'])

  const ds = parseDriverStandings({ MRData: { StandingsTable: { StandingsLists: [{ DriverStandings: [
    { position: '1', points: '156', wins: '5', Driver: { driverId: 'antonelli', code: 'ANT', permanentNumber: '12', givenName: 'Andrea Kimi', familyName: 'Antonelli', nationality: 'Italian' }, Constructors: [{ constructorId: 'mercedes', name: 'Mercedes' }] },
  ] }] } } })
  check('f1 driver standings parsed', [ds[0].driverId, ds[0].points, ds[0].wins, ds[0].constructorId, ds[0].name],
    ['antonelli', 156, 5, 'mercedes', 'Andrea Kimi Antonelli'])

  const cs = parseConstructorStandings({ MRData: { StandingsTable: { StandingsLists: [{ ConstructorStandings: [
    { position: '1', points: '262', wins: '5', Constructor: { constructorId: 'mercedes', name: 'Mercedes' } },
  ] }] } } })
  check('f1 constructor standings parsed', [cs[0].constructorId, cs[0].points], ['mercedes', 262])

  const res = parseResults({ MRData: { RaceTable: { Races: [
    { round: '1', Results: [
      { position: '1', points: '25', grid: '1', status: 'Finished', Driver: { driverId: 'russell' }, Constructor: { constructorId: 'mercedes' }, Time: { time: '1:23:06.801' }, FastestLap: { rank: '2', Time: { time: '1:22.670' } } },
      { position: '2', points: '18', grid: '3', status: 'Finished', Driver: { driverId: 'leclerc' }, Constructor: { constructorId: 'ferrari' }, FastestLap: { rank: '1' } },
      { position: '3', points: '15', grid: '2', status: 'Finished', Driver: { driverId: 'norris' }, Constructor: { constructorId: 'mclaren' } },
    ] },
  ] } } })
  check('f1 results winner/podium', [res[1].winnerId, res[1].podium], ['russell', ['russell', 'leclerc', 'norris']])
  check('f1 results pole + fastest lap', [res[1].poleId, res[1].fastestLapDriverId], ['russell', 'leclerc'])
  check('f1 results time + best lap parsed', [res[1].results[0].time, res[1].results[0].fastestLap], ['1:23:06.801', '1:22.670'])

  const model = normalize({ season: '2026', schedule: sched, driverStandings: ds, constructorStandings: cs, results: res })
  check('f1 normalize merges round result', [model.rounds[0].done, model.rounds[0].winnerId], [true, 'russell'])
  check('f1 normalize sorts drivers by position', model.drivers[0].driverId, 'antonelli')
  // bad/empty payloads never throw — parsers return empty, normalize stays safe
  check('f1 parsers tolerate empty payload', [parseSchedule({}).length, parseDriverStandings({}).length], [0, 0])

  // Jolpica caps `limit` at 100 rows, so results are paged and a race can be
  // split across a page boundary; fetchAllResults must stitch pages back together.
  {
    const row = (pos, driverId) => ({
      position: String(pos), points: '0', grid: String(pos), status: 'Finished',
      Driver: { driverId }, Constructor: { constructorId: 'x' },
    })
    const pages = {
      0: { MRData: { total: '5', limit: '3', offset: '0', RaceTable: { Races: [
        { round: '1', Results: [row(1, 'a'), row(2, 'b')] },
        { round: '2', Results: [row(1, 'c')] },
      ] } } },
      3: { MRData: { total: '5', limit: '3', offset: '3', RaceTable: { Races: [
        { round: '2', Results: [row(2, 'd')] },
        { round: '3', Results: [row(1, 'e')] },
      ] } } },
    }
    const urls = []
    const getJson = async (url) => {
      urls.push(url)
      const offset = Number(new URL(url).searchParams.get('offset') ?? 0)
      return pages[offset]
    }
    const all = await fetchAllResults(getJson, '2026')
    check('f1 paged results fetch every page', urls.length, 2)
    check('f1 split round stitched across pages', all[2].results.map((x) => x.driverId), ['c', 'd'])
    check('f1 split round keeps winner from first page', all[2].winnerId, 'c')
    check('f1 all rounds present after paging', [all[1].winnerId, all[3].winnerId], ['a', 'e'])
  }
}

// ---------- Leagues (ESPN league soccer) registry / parsing ----------
{
  check('leagues registry has the five majors', LEAGUES.map((l) => l.id),
    ['epl', 'laliga', 'seriea', 'bundesliga', 'ligue1'])
  check('leagueById resolves and falls through', [leagueById('seriea')?.espn, leagueById('nope')], ['ita.1', null])
  check('default league is epl', DEFAULT_LEAGUE, 'epl')

  const stat = (name, value) => ({ name, value, displayValue: String(value) })
  const entry = (rank, name, pts, note) => ({
    team: { id: String(rank), displayName: name, abbreviation: name.slice(0, 3).toUpperCase(),
      logos: [{ href: `https://x/${rank}.png` }] },
    ...(note ? { note } : {}),
    stats: [stat('rank', rank), stat('gamesPlayed', 38), stat('wins', 25), stat('ties', 10),
      stat('losses', 3), stat('pointsFor', 80), stat('pointsAgainst', 30),
      stat('pointDifferential', 50), stat('points', pts)],
  })
  const stJson = {
    season: { year: 2025, displayName: '2025-26 English Premier League' },
    children: [{ standings: { entries: [
      entry(2, 'Manchester City', 78),
      entry(1, 'Arsenal', 85, { color: '#81D6AC', description: 'Champions League', rank: 1 }),
    ] } }],
  }
  const st = parseLeagueStandings(stJson)
  check('league standings season label + year', [st.season, st.seasonYear], ['2025-26 English Premier League', 2025])
  check('league standings sorted by rank', st.rows.map((r) => r.name), ['Arsenal', 'Manchester City'])
  check('league standings row fields', [st.rows[0].played, st.rows[0].w, st.rows[0].d, st.rows[0].l,
    st.rows[0].gf, st.rows[0].ga, st.rows[0].gd, st.rows[0].pts], [38, 25, 10, 3, 80, 30, 50, 85])
  check('league standings note + logo', [st.rows[0].note, st.rows[1].note, st.rows[0].logo],
    ['Champions League', null, 'https://x/1.png'])
  check('league standings tolerates empty payload', parseLeagueStandings({}).rows.length, 0)

  const ev = (id, date, state, hs, as) => ({
    id, date, name: 'A at B',
    status: { type: { state, detail: state === 'post' ? 'FT' : date } },
    competitions: [{ competitors: [
      { homeAway: 'home', score: hs, team: { id: 'h', displayName: 'Home FC', abbreviation: 'HOM', logo: 'https://x/h.png' } },
      { homeAway: 'away', score: as, team: { id: 'a', displayName: 'Away FC', abbreviation: 'AWA', logo: 'https://x/a.png' } },
    ] }],
  })
  const sb = parseLeagueScoreboard({ events: [ev('1', '2026-05-17T11:30Z', 'post', '3', '2'), ev('2', '2026-08-15T14:00Z', 'pre')] })
  check('league scoreboard post match parsed', [sb[0].state, sb[0].home.name, sb[0].home.score, sb[0].away.score],
    ['post', 'Home FC', 3, 2])
  check('league scoreboard pre match has null scores', [sb[1].state, sb[1].home.score, sb[1].away.score], ['pre', null, null])
  check('league scoreboard tolerates empty payload', parseLeagueScoreboard({}).length, 0)

  // Season fallback: current season not yet started (all zero games) → previous season
  {
    const zero = (rank, name) => ({ ...entry(rank, name, 0), stats: [stat('rank', rank), stat('gamesPlayed', 0), stat('points', 0)] })
    const calls = []
    const getJson = async (url) => {
      calls.push(url)
      if (url.includes('season=')) return stJson
      return { season: { year: 2026, displayName: '2026-27 English Premier League' },
        children: [{ standings: { entries: [zero(1, 'AFC Bournemouth')] } }] }
    }
    const got = await fetchLeagueStandings(getJson, 'eng.1')
    check('league standings falls back to played season', [got.season, calls.length], ['2025-26 English Premier League', 2])
    check('league standings fallback asks for previous year', calls[1].includes('season=2025'), true)
  }

  // Match windows: widen when the near window is empty (summer break)
  {
    const post = ev('10', '2026-05-17T11:30Z', 'post', '1', '0')
    const calls = []
    const getJson = async (url) => {
      calls.push(url)
      return calls.length <= 2 ? { events: [] } : { events: [post, post] }
    }
    const got = await fetchLeagueMatches(getJson, 'eng.1', new Date('2026-07-06T12:00:00Z'))
    check('league matches widen empty windows and dedupe', [got.length, calls.length >= 3], [1, true])
  }

  // Teams list / roster / team schedule parsers
  const teams = parseTeams({ sports: [{ leagues: [{ teams: [
    { team: { id: '359', displayName: 'Arsenal', shortDisplayName: 'Arsenal', abbreviation: 'ARS',
      color: 'EF0107', logos: [{ href: 'https://x/359.png' }] } },
    { team: { id: '360', displayName: 'Manchester United', shortDisplayName: 'Man United', abbreviation: 'MAN' } },
  ] }] }] })
  check('league teams parsed + sorted by name', [teams.length, teams[0].name, teams[0].logo, teams[1].abbrev],
    [2, 'Arsenal', 'https://x/359.png', 'MAN'])
  check('league teams tolerates empty payload', parseTeams({}).length, 0)

  const roster = parseRoster({
    coach: [{ firstName: 'Arsene', lastName: 'Wenger' }],
    athletes: [
      { id: '1', displayName: 'Reiss Nelson', jersey: '24', age: 26, citizenship: 'England',
        position: { abbreviation: 'F' } },
      { id: '2', displayName: 'A Keeper', jersey: '1', age: 30, citizenship: 'Spain',
        position: { abbreviation: 'G' } },
    ],
  })
  check('league roster coach + groups', [roster.coach, roster.players[0].group, roster.players[1].group],
    ['Arsene Wenger', 'GK', 'FWD'])
  check('league roster player fields', [roster.players[1].name, roster.players[1].jersey, roster.players[1].country],
    ['Reiss Nelson', '24', 'England'])
  check('league roster tolerates empty payload', parseRoster({}).players.length, 0)

  const schedEv = (id, date, state, ourScore, oppScore) => ({
    id, date, name: 'X at Y',
    competitions: [{
      venue: { fullName: 'Emirates Stadium' },
      status: { type: { state } },
      competitors: [
        { homeAway: 'home', team: { id: '359', displayName: 'Arsenal', abbreviation: 'ARS' },
          ...(ourScore != null ? { score: { displayValue: ourScore } } : {}) },
        { homeAway: 'away', team: { id: '349', displayName: 'Bournemouth', abbreviation: 'BOU' },
          ...(oppScore != null ? { score: { displayValue: oppScore } } : {}) },
      ],
    }],
  })
  const sched = parseTeamSchedule({ season: { year: 2025 },
    events: [schedEv('2', '2026-05-01T14:00Z', 'post', '3', '1'), schedEv('1', '2025-09-01T14:00Z', 'post', '0', '0')] })
  check('team schedule sorted by date with venue', [sched.matches[0].id, sched.matches[0].venue],
    ['1', 'Emirates Stadium'])
  check('team schedule scores + state', [sched.matches[1].home.score, sched.matches[1].away.score, sched.matches[1].state],
    [3, 1, 'post'])
  check('team schedule season year', sched.seasonYear, 2025)
  check('team schedule tolerates empty payload', parseTeamSchedule({}).matches.length, 0)

  // Team bundle: results fall back to previous season when current has none
  {
    const calls = []
    const getJson = async (url) => {
      calls.push(url)
      if (url.includes('/roster')) return { coach: [{ firstName: 'A', lastName: 'B' }], athletes: [] }
      if (url.includes('fixture=true')) return { season: { year: 2026 }, events: [schedEv('9', '2026-08-21T19:00Z', 'pre')] }
      if (url.includes('season=2025')) return { season: { year: 2025 }, events: [schedEv('2', '2026-05-01T14:00Z', 'post', '3', '1')] }
      return { season: { year: 2026 }, events: [] } // current-season schedule: nothing played yet
    }
    const bundle = await fetchTeamBundle(getJson, 'eng.1', '359')
    check('team bundle fixtures + coach', [bundle.fixtures[0].id, bundle.roster.coach], ['9', 'A B'])
    check('team bundle results fall back a season', [bundle.results[0].id, calls.some((u) => u.includes('season=2025'))],
      ['2', true])
  }
}

// ---------- OpenF1 (race detail) parsing ----------
{
  const sessions = parseSessions([
    { session_key: 11234, date_start: '2026-03-08T04:00:00+00:00', country_name: 'Australia', circuit_short_name: 'Melbourne' },
    { session_key: 11245, date_start: '2026-03-15T07:00:00+00:00', country_name: 'China', circuit_short_name: 'Shanghai' },
  ])
  check('openf1 session by date', raceSessionKeyForDate(sessions, '2026-03-15'), 11245)
  check('openf1 session missing date', raceSessionKeyForDate(sessions, '2099-01-01'), null)

  const drivers = parseDrivers([
    { driver_number: 4, full_name: 'Lando NORRIS', name_acronym: 'NOR', team_name: 'McLaren', team_colour: 'F47600' },
    { driver_number: 16, full_name: 'Charles LECLERC', name_acronym: 'LEC', team_name: 'Ferrari', team_colour: 'ED1131' },
  ])
  check('openf1 driver colour hashed', drivers[0].colour, '#F47600')

  const pits = parsePits([
    { driver_number: 4, pit_duration: 23.1 }, { driver_number: 4, pit_duration: 22.4 }, { driver_number: 16, pit_duration: 24.0 },
  ])
  check('openf1 pit stops counted', [pits[4].stops, pits[4].best], [2, 22.4])

  const tyres = parseStints([
    { driver_number: 4, stint_number: 1, compound: 'MEDIUM' },
    { driver_number: 4, stint_number: 2, compound: 'MEDIUM' },
    { driver_number: 4, stint_number: 3, compound: 'HARD' },
  ])
  check('openf1 tyre stints merged', tyres[4], ['MEDIUM', 'HARD'])

  const n2id = numberToDriverId(drivers, [{ driverId: 'norris', code: 'NOR' }, { driverId: 'leclerc', code: 'LEC' }])
  check('openf1 number -> driverId via code', [n2id[4], n2id[16]], ['norris', 'leclerc'])
}

// ---------- season stats (records) ----------
{
  const model = {
    rounds: [
      {
        round: 1, done: true, poleId: 'a', fastestLapDriverId: 'b',
        results: [
          { pos: 1, driverId: 'a', grid: 2, status: 'Finished' },
          { pos: 2, driverId: 'b', grid: 1, status: 'Finished' },
          { pos: 3, driverId: 'c', grid: 5, status: 'Finished' },
          { pos: 20, driverId: 'd', grid: 4, status: 'Accident' },
        ],
      },
      { round: 2, done: false },
    ],
    drivers: [{ driverId: 'a', name: 'A', wins: 1, points: 25 }, { driverId: 'b', name: 'B', wins: 0, points: 18 }],
    constructors: [{ constructorId: 'x', name: 'X', points: 43 }],
  }
  const s = seasonStats(model)
  check('stats races done/total', [s.racesDone, s.racesTotal], [1, 2])
  check('stats most poles', s.mostPoles.id, 'a')
  check('stats biggest climb (grid->finish)', [s.bestClimb.driverId, s.bestClimb.gained], ['c', 2])
  check('stats most DNFs', s.mostDnfs.id, 'd')
  check('stats leader + top constructor', [s.leader.driverId, s.topConstructor.constructorId], ['a', 'x'])
}

// ---------- SSR smoke: every route renders ----------
{
  globalThis.matchMedia = () => ({ matches: false })
  const routes = ['/', '/groups', '/schedule', '/teams', '/team/brazil', '/team/curacao',
    '/team/nope', '/scorers', '/compare?a=brazil&b=argentina',
    '/f1', '/f1/stats', '/f1/teams', '/f1/team/mclaren', '/f1/team/nope',
    '/f1/drivers', '/f1/driver/piastri', '/f1/driver/nope',
    '/f1/circuits', '/f1/circuit/monaco', '/f1/circuit/nope',
    '/f1/race/1', '/f1/race/7', '/f1/race/999',
    '/leagues', '/leagues/epl', '/leagues/laliga', '/leagues/bundesliga/fixtures', '/leagues/nope',
    '/leagues/epl/teams', '/leagues/seriea/team/110', '/leagues/nope/teams']
  for (const r of routes) {
    try {
      const html = renderToString(
        <MemoryRouter initialEntries={[r]}>
          <DataProvider>
            <F1DataProvider><LeaguesDataProvider><App /></LeaguesDataProvider></F1DataProvider>
          </DataProvider>
        </MemoryRouter>,
      )
      check(`route ${r} renders`, html.length > 700, true)
      if (r === '/') {
        check('feedback button present', html.includes('Send feedback'), true)
        check('sport switcher present', html.includes('sport-switcher'), true)
      }
      if (r === '/groups') {
        const groups = [...html.matchAll(/Group <!-- -->([A-L])</g)].map((m) => m[1]).join('')
        check('all 12 groups render', groups, 'ABCDEFGHIJKL')
      }
      if (r === '/team/brazil') {
        check('coach label shown', html.includes('Head coach'), true)
        check('coach name shown', html.includes('Carlo Ancelotti'), true)
      }
      if (r === '/f1') {
        check('f1 section title shown', html.includes('Grand Prix 2026'), true)
        check('f1 calendar shows a round', html.includes('Australian Grand Prix'), true)
        check('f1 tab Stats present', html.includes('Stats'), true)
      }
      if (r === '/f1/drivers') {
        check('f1 drivers championship title', html.includes('Drivers&#x2019; Championship') || html.includes('Championship'), true)
      }
      if (r === '/f1/teams') {
        check('f1 constructors championship title', html.includes('Constructors'), true)
      }
      if (r === '/f1/stats') {
        check('f1 stats records render', html.includes('Season records'), true)
      }
      if (r === '/f1/driver/piastri') {
        check('f1 driver page renders results', html.includes('most recent first'), true)
      }
      if (r === '/f1/race/1') {
        check('f1 race classification renders', html.includes('Classification'), true)
        check('f1 race summary renders', html.includes('Race summary'), true)
      }
    } catch (e) {
      fails++
      console.log(`FAIL route ${r}: ${e.message}`)
    }
  }
  // Unconfigured (no env) ad slot must render nothing — never an empty box.
  check('ad slot renders nothing when unconfigured', renderToString(<AdSlot />), '')
}

// ---------- analytics (env-gated, no-op when unconfigured) ----------
{
  check('analytics disabled without a key', analyticsEnabled(), false)
  check('normalizeRoute collapses team slugs', normalizeRoute('/team/brazil'), '/team/:slug')
  check('normalizeRoute keeps static routes', normalizeRoute('/schedule'), '/schedule')
  check('normalizeRoute defaults empty to /', normalizeRoute(''), '/')
  // calls must be safe no-ops when disabled (never throw, never load posthog)
  let threw = false
  try {
    track('test_event', { a: 1 })
    trackPageview('/team/brazil')
  } catch {
    threw = true
  }
  check('track/trackPageview are safe no-ops', threw, false)
}

console.log(fails ? `\n${fails} FAILURE(S)` : '\nall tests passed')
process.exit(fails ? 1 : 0)

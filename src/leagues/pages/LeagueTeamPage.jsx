import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { track } from '../../lib/analytics'
import { leagueById, DEFAULT_LEAGUE } from '../lib/leagues'
import { useLeagueData, useLeagueTeam } from '../lib/data.jsx'
import { clubInfo } from '../data/clubs'
import { LeagueMatchDays } from '../components/LeagueMatchCard'

const GROUP_LABEL = { GK: 'Goalkeepers', DEF: 'Defenders', MID: 'Midfielders', FWD: 'Forwards', OTH: 'Squad' }

const ordinal = (n) => {
  const v = n % 100
  return v >= 11 && v <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th')
}

export default function LeagueTeamPage() {
  const { league, teamId } = useParams()
  const info = leagueById(league)
  const { standings, teams } = useLeagueData(info ? league : DEFAULT_LEAGUE)
  const bundle = useLeagueTeam(info ? league : DEFAULT_LEAGUE, teamId)
  const [showPrevious, setShowPrevious] = useState(false)
  useEffect(() => {
    if (info) track('league_team_viewed', { league, teamId })
  }, [info, league, teamId])
  if (!info) return <Navigate to={`/leagues/${DEFAULT_LEAGUE}/teams`} replace />

  const team = teams.find((t) => t.id === teamId)
  const row = standings.rows.find((r) => r.teamId === teamId)
  const curated = clubInfo(teamId)
  const fixtures = bundle?.fixtures ?? []
  const results = (bundle?.results ?? []).slice().reverse() // newest first
  const next = fixtures[0]
  const players = bundle?.roster?.players ?? []
  const groups = ['GK', 'DEF', 'MID', 'FWD', 'OTH'].filter((g) => players.some((p) => p.group === g))
  const squadCounts = groups
    .filter((g) => g !== 'OTH')
    .map((g) => `${players.filter((p) => p.group === g).length} ${g}`)
    .join(' · ')

  return (
    <div className="page">
      <p className="hint">
        <Link to={`/leagues/${league}/teams`}>← All {info.name} clubs</Link>
      </p>
      <div className="card league-team-head">
        {team?.logo && <img src={team.logo} alt="" />}
        <div>
          <h2>{team?.name ?? `Club #${teamId}`}</h2>
          {row && (
            <p className="muted">
              {standings.season}: {row.rank}
              {ordinal(row.rank)} · {row.pts} pts
              {row.note ? ` · ${row.note}` : ''}
            </p>
          )}
        </div>
      </div>

      {row && (
        <div className="card">
          <h3>Season stats {standings.season ? `(${standings.season})` : ''}</h3>
          <div className="league-stat-grid">
            <span>Played <b>{row.played}</b></span>
            <span>W-D-L <b>{row.w}-{row.d}-{row.l}</b></span>
            <span>Goals <b>{row.gf}:{row.ga}</b></span>
            <span>Diff <b>{row.gd > 0 ? `+${row.gd}` : row.gd}</b></span>
            <span>Points <b>{row.pts}</b></span>
            <span>Rank <b>{row.rank}</b></span>
          </div>
        </div>
      )}

      <h3 className="league-group-title">Next match</h3>
      {next ? (
        <LeagueMatchDays league={league} matches={[next]} />
      ) : (
        <p className="muted">No upcoming fixture scheduled yet.</p>
      )}
      {fixtures.length > 1 && (
        <>
          <h3 className="league-group-title">Upcoming</h3>
          <LeagueMatchDays league={league} matches={fixtures.slice(1, 6)} />
        </>
      )}

      <button className="collapse-head league-collapse" onClick={() => setShowPrevious((v) => !v)} aria-expanded={showPrevious}>
        <span className="collapse-title">Previous matches{results.length ? ` (${results.length})` : ''}</span>
        <span>{showPrevious ? '▴' : '▾'}</span>
      </button>
      {showPrevious &&
        (results.length ? (
          <LeagueMatchDays league={league} matches={results} />
        ) : (
          <p className="muted">{bundle ? 'No played matches on record.' : 'Loading matches…'}</p>
        ))}

      <h3 className="league-group-title">Squad</h3>
      {players.length ? (
        <div className="card">
          {bundle?.roster?.coach && (
            <p className="muted">
              Head coach: <b>{bundle.roster.coach}</b>
              {squadCounts ? ` · ${squadCounts}` : ''}
            </p>
          )}
          {groups.map((g) => (
            <div key={g}>
              <h4>{GROUP_LABEL[g]}</h4>
              {players
                .filter((p) => p.group === g)
                .map((p) => (
                  <div key={p.id ?? p.name} className="league-player">
                    <span className="league-jersey">{p.jersey ?? '–'}</span>
                    <span className="league-player-name">{p.name}</span>
                    <span className="muted">
                      {p.country ?? ''}
                      {p.age ? ` · ${p.age}` : ''}
                    </span>
                  </div>
                ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">{bundle ? 'Squad list unavailable.' : 'Loading squad…'}</p>
      )}

      {curated && (curated.honours?.length || curated.facts?.length) ? (
        <>
          <h3 className="league-group-title">Honours & facts</h3>
          <div className="card">
            {curated.honours?.length > 0 && (
              <>
                <h4>Major honours</h4>
                <ul className="league-facts">
                  {curated.honours.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </>
            )}
            {curated.facts?.length > 0 && (
              <>
                <h4>Fun facts</h4>
                <ul className="league-facts">
                  {curated.facts.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}

import { Navigate, useParams } from 'react-router-dom'
import { leagueById, DEFAULT_LEAGUE } from '../lib/leagues'
import { useLeagueData } from '../lib/data.jsx'
import LeaguePicker from '../components/LeaguePicker'
import { LeagueMatchDays } from '../components/LeagueMatchCard'
import { tzLabel } from '../../lib/format'

export default function LeagueFixturesPage() {
  const { league } = useParams()
  const info = leagueById(league)
  const { matches } = useLeagueData(info ? league : DEFAULT_LEAGUE)
  if (!info) return <Navigate to={`/leagues/${DEFAULT_LEAGUE}/fixtures`} replace />
  const results = matches.filter((m) => m.state === 'post').reverse() // newest first
  const upcoming = matches.filter((m) => m.state !== 'post') // soonest first
  return (
    <div className="page">
      <LeaguePicker active={league} page="/fixtures" />
      <h2>
        {info.flag} {info.name} — fixtures & results
      </h2>
      <p className="muted">Times shown in your time zone ({tzLabel()}).</p>
      <h3 className="league-group-title">Upcoming</h3>
      {upcoming.length ? (
        <LeagueMatchDays matches={upcoming} />
      ) : (
        <p className="muted">Fixtures appear here once the season schedule is published.</p>
      )}
      <h3 className="league-group-title">Results</h3>
      {results.length ? <LeagueMatchDays matches={results} /> : <p className="muted">No recent matches.</p>}
    </div>
  )
}

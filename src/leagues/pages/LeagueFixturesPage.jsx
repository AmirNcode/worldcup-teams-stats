import { Navigate, useParams } from 'react-router-dom'
import { leagueById, DEFAULT_LEAGUE } from '../lib/leagues'
import { useLeagueData } from '../lib/data.jsx'
import LeaguePicker from '../components/LeaguePicker'
import { fmtDate, fmtTime } from '../../lib/format'

function MatchRow({ m }) {
  const played = m.state === 'post'
  return (
    <div className="league-match">
      <span className="league-side home">
        {m.home.name} {m.home.logo && <img src={m.home.logo} alt="" loading="lazy" />}
      </span>
      {played ? (
        <span className="league-score">
          {m.home.score} – {m.away.score}
        </span>
      ) : (
        <span className="league-kickoff">{fmtTime(m.date)}</span>
      )}
      <span className="league-side away">
        {m.away.logo && <img src={m.away.logo} alt="" loading="lazy" />} {m.away.name}
      </span>
    </div>
  )
}

// Matches grouped by local calendar day, one card per group.
function DayGroups({ matches }) {
  const byDay = new Map()
  for (const m of matches) {
    const day = fmtDate(m.date)
    if (!byDay.has(day)) byDay.set(day, [])
    byDay.get(day).push(m)
  }
  return [...byDay.entries()].map(([day, list]) => (
    <div className="card" key={day}>
      <h3 className="league-day">{day}</h3>
      {list.map((m) => (
        <MatchRow key={m.id} m={m} />
      ))}
    </div>
  ))
}

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
      <p className="muted">Kickoff times are shown in your local time zone.</p>
      <h3 className="league-group-title">Upcoming</h3>
      {upcoming.length ? (
        <DayGroups matches={upcoming} />
      ) : (
        <p className="muted">Fixtures appear here once the season schedule is published.</p>
      )}
      <h3 className="league-group-title">Results</h3>
      {results.length ? <DayGroups matches={results} /> : <p className="muted">No recent matches.</p>}
    </div>
  )
}

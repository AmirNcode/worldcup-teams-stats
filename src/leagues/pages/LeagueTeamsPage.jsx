import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { leagueById, DEFAULT_LEAGUE } from '../lib/leagues'
import { useLeagueData } from '../lib/data.jsx'
import LeaguePicker from '../components/LeaguePicker'

export default function LeagueTeamsPage() {
  const { league } = useParams()
  const info = leagueById(league)
  const { teams } = useLeagueData(info ? league : DEFAULT_LEAGUE)
  const [q, setQ] = useState('')
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return teams
    return teams.filter(
      (t) => t.name.toLowerCase().includes(needle) || t.abbrev.toLowerCase().includes(needle),
    )
  }, [teams, q])
  if (!info) return <Navigate to={`/leagues/${DEFAULT_LEAGUE}/teams`} replace />
  return (
    <div className="page">
      <LeaguePicker active={league} page="/teams" />
      <h2>
        {info.flag} {info.name} — clubs
      </h2>
      <input
        className="search"
        type="search"
        placeholder="Search clubs…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search clubs"
      />
      <div className="card">
        {shown.map((t) => (
          <Link key={t.id} className="league-team-row" to={`/leagues/${league}/team/${t.id}`}>
            {t.logo ? <img src={t.logo} alt="" loading="lazy" /> : <span className="league-team-dot" />}
            <span className="league-team-name">{t.name}</span>
            <span className="muted">{t.abbrev}</span>
          </Link>
        ))}
        {!shown.length && <p className="muted">No clubs match “{q}”.</p>}
      </div>
    </div>
  )
}

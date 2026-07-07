import { Navigate, useParams } from 'react-router-dom'
import { leagueById, DEFAULT_LEAGUE } from '../lib/leagues'
import { useLeagueData } from '../lib/data.jsx'
import LeaguePicker from '../components/LeaguePicker'

// Top scorers ("golden boot race") per league, styled like the World Cup
// Golden Boot page: rank, player, goals, goals per match — with the league's
// real award name (Pichichi, Capocannoniere, …) as the explainer. Assists
// leaders follow in a second card.
function LeadersTable({ rows, valueLabel }) {
  return (
    <table className="standings league-scorers">
      <thead>
        <tr>
          <th className="pos">#</th>
          <th className="team-col">Player</th>
          <th>MP</th>
          <th>{valueLabel}</th>
          <th>{valueLabel === 'Goals' ? 'G/Match' : 'A/Match'}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.id ?? r.name}>
            <td className="pos">{i + 1}</td>
            <td className="team-col">{r.name}</td>
            <td>{r.matches ?? '—'}</td>
            <td className="pts">{r.value}</td>
            <td>{r.matches ? (r.value / r.matches).toFixed(2) : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function LeagueScorersPage() {
  const { league } = useParams()
  const info = leagueById(league)
  const { leaders, standings } = useLeagueData(info ? league : DEFAULT_LEAGUE)
  if (!info) return <Navigate to={`/leagues/${DEFAULT_LEAGUE}/scorers`} replace />
  return (
    <div className="page">
      <LeaguePicker active={league} page="/scorers" />
      <h2>
        {info.flag} {info.name} — top scorers
      </h2>
      <p className="muted">
        The race for the {info.award}{standings.season ? ` · ${standings.season}` : ''}.
      </p>
      {leaders.goals.length ? (
        <div className="card">
          <h3>👟 Goals</h3>
          <LeadersTable rows={leaders.goals} valueLabel="Goals" />
        </div>
      ) : (
        <p className="muted">Scorer standings appear once the season is underway.</p>
      )}
      {leaders.assists.length > 0 && (
        <div className="card">
          <h3>🎯 Assists</h3>
          <LeadersTable rows={leaders.assists} valueLabel="Assists" />
        </div>
      )}
    </div>
  )
}

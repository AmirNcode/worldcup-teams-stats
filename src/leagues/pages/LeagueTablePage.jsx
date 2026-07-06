import { Navigate, useParams } from 'react-router-dom'
import { leagueById, DEFAULT_LEAGUE } from '../lib/leagues'
import { useLeagueData } from '../lib/data.jsx'
import LeaguePicker from '../components/LeaguePicker'

// Zone shading from ESPN's rank note: continental qualification in green,
// relegation in red; anything else (e.g. play-offs) gets the soft middle tone.
function zoneClass(note) {
  if (!note) return ''
  const n = note.toLowerCase()
  if (n.includes('relegation')) return 'relegated'
  if (n.includes('champions league')) return 'qualifying'
  return 'maybe'
}

export default function LeagueTablePage() {
  const { league } = useParams()
  const info = leagueById(league)
  const { standings } = useLeagueData(info ? league : DEFAULT_LEAGUE)
  if (!info) return <Navigate to={`/leagues/${DEFAULT_LEAGUE}`} replace />
  return (
    <div className="page">
      <LeaguePicker active={league} />
      <div className="card">
        <h2>
          {info.flag} {info.name}
        </h2>
        {standings.season && <p className="muted league-season">{standings.season}</p>}
        <table className="standings league-table">
          <thead>
            <tr>
              <th className="pos">#</th>
              <th className="team-col">Team</th>
              <th>MP</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GF</th>
              <th>GA</th>
              <th>GD</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.rows.map((row) => (
              <tr key={row.teamId ?? row.name} className={zoneClass(row.note)} title={row.note ?? undefined}>
                <td className="pos">{row.rank}</td>
                <td className="team-col">
                  <span className="league-team">
                    {row.logo && <img src={row.logo} alt="" loading="lazy" />}
                    {row.name}
                  </span>
                </td>
                <td>{row.played}</td>
                <td>{row.w}</td>
                <td>{row.d}</td>
                <td>{row.l}</td>
                <td>{row.gf}</td>
                <td>{row.ga}</td>
                <td>{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                <td className="pts">{row.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted league-legend">
          Shaded rows: green = Champions League, neutral = other European spots, red = relegation.
        </p>
      </div>
    </div>
  )
}

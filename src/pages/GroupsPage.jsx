import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useData, matchStatus } from '../lib/data.jsx'
import { computeGroups } from '../lib/standings'
import { useFavorite } from '../lib/prefs'
import { fmtDate, fmtTime } from '../lib/format'
import teams from '../data/teams.json'
import TeamTag from '../components/TeamTag'

function FavoriteCard({ favorite, matches }) {
  const t = teams[favorite]
  if (!t) return null
  const next = matches.find(
    (m) =>
      (m.team1 === favorite || m.team2 === favorite) && matchStatus(m) === 'upcoming',
  )
  return (
    <Link className="fav-card" to={`/team/${t.slug}`}>
      <span className="flag big">{t.flag}</span>
      <div>
        <div className="fav-name">{favorite}</div>
        {next ? (
          <div className="fav-next">
            Next: vs {next.team1 === favorite ? next.team2 : next.team1} ·{' '}
            {fmtDate(next.kickoff)}, {fmtTime(next.kickoff)}
          </div>
        ) : (
          <div className="fav-next">View team stats →</div>
        )}
      </div>
      <span className="star">★</span>
    </Link>
  )
}

export default function GroupsPage() {
  const { matches } = useData()
  const [favorite] = useFavorite()
  const groups = useMemo(() => computeGroups(matches), [matches])

  return (
    <div className="page">
      {favorite && <FavoriteCard favorite={favorite} matches={matches} />}
      <p className="hint">
        Top 2 of each group + the 8 best third-placed teams advance to the Round of 32.
        Tap a team for full stats.
      </p>
      <div className="group-grid">
        {Object.keys(groups)
          .sort()
          .map((g) => (
            <section className="card" key={g}>
              <h2>Group {g}</h2>
              <table className="standings">
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
                  {groups[g].map((row, i) => (
                    <tr key={row.team} className={i < 2 ? 'qualifying' : i === 2 ? 'maybe' : ''}>
                      <td className="pos">{i + 1}</td>
                      <td className="team-col">
                        <TeamTag name={row.team} />
                        {favorite === row.team && <span className="star inline">★</span>}
                      </td>
                      <td>{row.mp}</td>
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
            </section>
          ))}
      </div>
    </div>
  )
}

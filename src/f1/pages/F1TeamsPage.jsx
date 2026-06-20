import { Link } from 'react-router-dom'
import { teamsByPoints, teamDrivers } from '../data'
import F1TeamLogo from '../components/F1TeamLogo'

export default function F1TeamsPage() {
  const teams = teamsByPoints()
  return (
    <div className="page">
      <p className="hint">Constructors in the 2026 championship. Tap a team for its drivers and stats.</p>
      <div className="team-list">
        {teams.map((t) => (
          <Link className="team-row" key={t.slug} to={`/f1/team/${t.slug}`}>
            <F1TeamLogo team={t} />
            <div className="team-row-main">
              <div className="team-row-name">{t.name}</div>
              <div className="team-row-sub">
                {teamDrivers(t.slug)
                  .map((d) => d.name)
                  .join(' · ')}
              </div>
            </div>
            <div className="team-row-tags">
              <span className="title-badge">{t.points} pts</span>
            </div>
          </Link>
        ))}
      </div>
      <p className="f1-note">Sample placeholder data.</p>
    </div>
  )
}

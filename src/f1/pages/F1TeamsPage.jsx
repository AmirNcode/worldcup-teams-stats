import { Link } from 'react-router-dom'
import { useF1Data } from '../lib/data.jsx'
import { constructorsByPoints, teamDrivers } from '../lib/select'
import F1TeamLogo from '../components/F1TeamLogo'

export default function F1TeamsPage() {
  const { model } = useF1Data()
  const teams = constructorsByPoints(model)
  return (
    <div className="page">
      <h2 className="section-title">Constructors’ Championship</h2>
      <p className="hint">
        Each team ranked by its two drivers’ combined points — the title that decides prize money. Tap a
        team for its drivers and stats.
      </p>
      <div className="team-list">
        {teams.map((t) => (
          <Link className="team-row" key={t.constructorId} to={`/f1/team/${t.constructorId}`}>
            <F1TeamLogo team={t} />
            <div className="team-row-main">
              <div className="team-row-name">{t.name}</div>
              <div className="team-row-sub">
                {teamDrivers(model, t.constructorId)
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
    </div>
  )
}

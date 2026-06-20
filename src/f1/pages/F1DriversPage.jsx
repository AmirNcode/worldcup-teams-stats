import { Link } from 'react-router-dom'
import { driversByPoints, teamBySlug } from '../data'

export default function F1DriversPage() {
  const drivers = driversByPoints()
  return (
    <div className="page">
      <p className="hint">Drivers in the 2026 championship. Tap a driver for results and stats.</p>
      <div className="team-list">
        {drivers.map((d) => {
          const t = teamBySlug(d.team)
          return (
            <Link className="team-row" key={d.slug} to={`/f1/driver/${d.slug}`}>
              <span className="driver-num">{d.number}</span>
              <div className="team-row-main">
                <div className="team-row-name">
                  {d.flag} {d.name}
                </div>
                <div className="team-row-sub">
                  {t?.name}
                  {d.wins > 0 ? ` · ${d.wins} wins` : ''}
                </div>
              </div>
              <div className="team-row-tags">
                <span className="f1-swatch" style={{ background: t?.color }} />
                <span className="title-badge">{d.points} pts</span>
              </div>
            </Link>
          )
        })}
      </div>
      <p className="f1-note">Sample placeholder data.</p>
    </div>
  )
}

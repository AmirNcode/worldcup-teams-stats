import { Link } from 'react-router-dom'
import { useF1Data } from '../lib/data.jsx'
import { driversByPoints, constructorById } from '../lib/select'

export default function F1DriversPage() {
  const { model } = useF1Data()
  const drivers = driversByPoints(model)
  const colorOf = (cid) => constructorById(model, cid)?.color
  return (
    <div className="page">
      <h2 className="section-title">Drivers’ Championship</h2>
      <p className="hint">
        Every driver ranked by total points this season — the top 10 in each Grand Prix score (25 for a
        win down to 1 for tenth). Tap a driver for results and stats.
      </p>
      <div className="team-list">
        {drivers.map((d) => (
          <Link className="team-row" key={d.driverId} to={`/f1/driver/${d.driverId}`}>
            <span className="driver-num">{d.number ?? d.code ?? '–'}</span>
            <div className="team-row-main">
              <div className="team-row-name">
                {d.flag} {d.name}
              </div>
              <div className="team-row-sub">
                {d.constructorName}
                {d.wins > 0 ? ` · ${d.wins} wins` : ''}
              </div>
            </div>
            <div className="team-row-tags">
              <span className="f1-swatch" style={{ background: colorOf(d.constructorId) }} />
              <span className="title-badge">{d.points} pts</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { circuits } from '../data'

export default function F1CircuitsPage() {
  return (
    <div className="page">
      <p className="hint">Circuits on the 2026 calendar. Tap one for track facts and the lap record.</p>
      <div className="team-list">
        {circuits.map((c) => (
          <Link className="team-row" key={c.slug} to={`/f1/circuit/${c.slug}`}>
            <span className="flag big">{c.flag}</span>
            <div className="team-row-main">
              <div className="team-row-name">{c.name}</div>
              <div className="team-row-sub">
                {c.locality}, {c.country} · {c.lengthKm} km · {c.laps} laps
              </div>
            </div>
          </Link>
        ))}
      </div>
      <p className="f1-note">Sample placeholder data.</p>
    </div>
  )
}

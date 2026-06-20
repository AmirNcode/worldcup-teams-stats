import { Link } from 'react-router-dom'
import { useF1Data } from '../lib/data.jsx'
import { circuitsOnCalendar } from '../lib/select'

export default function F1CircuitsPage() {
  const { model } = useF1Data()
  const circuits = circuitsOnCalendar(model)
  return (
    <div className="page">
      <p className="hint">Circuits on the {model.season} calendar. Tap one for track facts and the lap record.</p>
      <div className="team-list">
        {circuits.map((c) => (
          <Link className="team-row" key={c.circuitId} to={`/f1/circuit/${c.circuitId}`}>
            <span className="flag big">{c.flag}</span>
            <div className="team-row-main">
              <div className="team-row-name">{c.name}</div>
              <div className="team-row-sub">
                {[c.locality, c.country].filter(Boolean).join(', ')}
                {c.lengthKm ? ` · ${c.lengthKm} km` : ''}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

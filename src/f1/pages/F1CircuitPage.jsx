import { Link, useParams } from 'react-router-dom'
import { useF1Data } from '../lib/data.jsx'
import { circuitById, doneRoundAtCircuit, driverById } from '../lib/select'

function Stat({ label, value }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default function F1CircuitPage() {
  const { slug } = useParams()
  const { model } = useF1Data()
  const c = circuitById(model, slug)

  if (!c) {
    return (
      <div className="page">
        <p className="hint">Circuit not found.</p>
        <Link to="/f1/circuits">← All circuits</Link>
      </div>
    )
  }

  const race = doneRoundAtCircuit(model, slug)
  const flDriver = race?.fastestLapDriverId ? driverById(model, race.fastestLapDriverId) : null

  return (
    <div className="page">
      <header className="team-header">
        <span className="flag huge">{c.flag}</span>
        <div>
          <h2>{c.name}</h2>
          <div className="team-sub">{[c.locality, c.country].filter(Boolean).join(', ')}</div>
        </div>
      </header>

      <section className="card">
        <h3>Track</h3>
        <div className="stat-grid">
          <Stat label="Lap length" value={c.lengthKm ? `${c.lengthKm} km` : '—'} />
          <Stat label="Laps" value={c.laps ?? '—'} />
          <Stat label="Race distance" value={c.lengthKm && c.laps ? `${(c.lengthKm * c.laps).toFixed(1)} km` : '—'} />
          <Stat label="Country" value={`${c.flag} ${c.country ?? ''}`} />
        </div>
      </section>

      <section className="card">
        <h3>Fastest laps</h3>
        {c.lapRecord ? (
          <p className="kv">
            <strong>Lap record:</strong> {c.lapRecord.time} — {c.lapRecord.driver} ({c.lapRecord.year})
          </p>
        ) : (
          <p className="hint">No lap record on file for this circuit yet.</p>
        )}
        {flDriver && (
          <p className="kv">
            <strong>Fastest lap, last race here:</strong>{' '}
            <Link to={`/f1/driver/${flDriver.driverId}`}>{flDriver.name}</Link>
          </p>
        )}
      </section>

      {c.facts.length > 0 && (
        <section className="card">
          <h3>Did you know?</h3>
          <ul className="facts">
            {c.facts.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

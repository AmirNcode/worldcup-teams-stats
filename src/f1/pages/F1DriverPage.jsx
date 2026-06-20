import { Link, useParams } from 'react-router-dom'
import { driverBySlug, teamBySlug, driversByPoints, driverResults } from '../data'

function Stat({ label, value }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default function F1DriverPage() {
  const { slug } = useParams()
  const d = driverBySlug(slug)

  if (!d) {
    return (
      <div className="page">
        <p className="hint">Driver not found.</p>
        <Link to="/f1/drivers">← All drivers</Link>
      </div>
    )
  }

  const t = teamBySlug(d.team)
  const pos = driversByPoints().findIndex((x) => x.slug === slug) + 1
  const results = driverResults(slug)

  return (
    <div className="page">
      <header className="team-header">
        <span className="driver-num">{d.number}</span>
        <div>
          <h2>
            {d.flag} {d.name}
          </h2>
          <div className="team-sub">
            <span className="f1-swatch" style={{ background: t?.color }} />{' '}
            {t ? <Link to={`/f1/team/${t.slug}`}>{t.name}</Link> : '—'} · {d.country}
          </div>
        </div>
      </header>

      <section className="card">
        <h3>2026 season</h3>
        <div className="stat-grid three">
          <Stat label="Position" value={`P${pos}`} />
          <Stat label="Points" value={d.points} />
          <Stat label="Wins" value={d.wins} />
          <Stat label="Podiums" value={d.podiums} />
          <Stat label="Poles" value={d.poles} />
          <Stat label="Car number" value={d.number} />
        </div>
      </section>

      <section className="card">
        <h3>Results — most recent first</h3>
        <table className="history-table">
          <tbody>
            {results.map((r) => (
              <tr key={r.round}>
                <td className="year">R{r.round}</td>
                <td>
                  <Link to={`/f1/circuit/${r.circuitSlug}`}>{r.name}</Link>
                </td>
                <td className={r.pos === 1 ? 'f1-win' : ''} style={{ textAlign: 'right' }}>
                  {r.pos ? `P${r.pos}${r.pos === 1 ? ' 🏆' : ''}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="f1-note">Sample placeholder data — not live results.</p>
    </div>
  )
}

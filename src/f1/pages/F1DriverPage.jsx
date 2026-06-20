import { Link, useParams } from 'react-router-dom'
import { useF1Data } from '../lib/data.jsx'
import { driverById, constructorById, driverResults } from '../lib/select'

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
  const { model } = useF1Data()
  const d = driverById(model, slug)

  if (!d) {
    return (
      <div className="page">
        <p className="hint">Driver not found.</p>
        <Link to="/f1/drivers">← All drivers</Link>
      </div>
    )
  }

  const team = constructorById(model, d.constructorId)
  const results = driverResults(model, slug)

  return (
    <div className="page">
      <header className="team-header">
        <span className="driver-num">{d.number ?? d.code ?? '–'}</span>
        <div>
          <h2>
            {d.flag} {d.name}
          </h2>
          <div className="team-sub">
            <span className="f1-swatch" style={{ background: team?.color }} />{' '}
            {team ? <Link to={`/f1/team/${team.constructorId}`}>{team.name}</Link> : d.constructorName} · {d.nationality}
          </div>
        </div>
      </header>

      <section className="card">
        <h3>{model.season} season</h3>
        <div className="stat-grid three">
          <Stat label="Position" value={d.position ? `P${d.position}` : '—'} />
          <Stat label="Points" value={d.points} />
          <Stat label="Wins" value={d.wins} />
        </div>
      </section>

      {results.length > 0 && (
        <section className="card">
          <h3>Results — most recent first</h3>
          <table className="history-table">
            <tbody>
              {results.map((r) => (
                <tr key={r.round}>
                  <td className="year">R{r.round}</td>
                  <td>
                    <Link to={`/f1/circuit/${r.circuitId}`}>{r.name}</Link>
                  </td>
                  <td className={r.pos === 1 ? 'f1-win' : ''} style={{ textAlign: 'right' }}>
                    {r.pos ? `P${r.pos}${r.pos === 1 ? ' 🏆' : ''}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}

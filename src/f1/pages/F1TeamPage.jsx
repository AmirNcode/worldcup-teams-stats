import { Link, useParams } from 'react-router-dom'
import { useF1Data } from '../lib/data.jsx'
import { constructorById, teamDrivers } from '../lib/select'
import F1TeamLogo from '../components/F1TeamLogo'

function Stat({ label, value }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default function F1TeamPage() {
  const { slug } = useParams()
  const { model } = useF1Data()
  const team = constructorById(model, slug)

  if (!team) {
    return (
      <div className="page">
        <p className="hint">Team not found.</p>
        <Link to="/f1/teams">← All teams</Link>
      </div>
    )
  }

  const roster = teamDrivers(model, slug)

  return (
    <div className="page">
      <header className="team-header">
        <F1TeamLogo team={team} className="big" />
        <div>
          <h2>{team.name}</h2>
          <div className="team-sub">
            {[team.base, team.powerUnit && `${team.powerUnit} power`].filter(Boolean).join(' · ')}
          </div>
        </div>
      </header>

      <section className="card">
        <h3>{model.season} season</h3>
        <div className="stat-grid">
          <Stat label="Championship position" value={team.position ? `P${team.position}` : '—'} />
          <Stat label="Points" value={team.points} />
          <Stat label="Wins" value={team.wins} />
          <Stat label="Constructors’ titles" value={team.championships ?? '—'} />
        </div>

        <h4>Drivers</h4>
        {roster.map((d) => (
          <Link className="team-row" key={d.driverId} to={`/f1/driver/${d.driverId}`}>
            <span className="driver-num">{d.number ?? d.code ?? '–'}</span>
            <div className="team-row-main">
              <div className="team-row-name">
                {d.flag} {d.name}
              </div>
              <div className="team-row-sub">
                {d.points} pts · {d.wins} wins · P{d.position}
              </div>
            </div>
          </Link>
        ))}
      </section>

      {team.facts.length > 0 && (
        <section className="card">
          <h3>Did you know?</h3>
          <ul className="facts">
            {team.facts.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

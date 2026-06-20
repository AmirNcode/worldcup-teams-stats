import { Link, useParams } from 'react-router-dom'
import { teamBySlug, teamDrivers, teamsByPoints } from '../data'
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
  const team = teamBySlug(slug)

  if (!team) {
    return (
      <div className="page">
        <p className="hint">Team not found.</p>
        <Link to="/f1/teams">← All teams</Link>
      </div>
    )
  }

  const pos = teamsByPoints().findIndex((t) => t.slug === slug) + 1
  const roster = teamDrivers(slug)

  return (
    <div className="page">
      <header className="team-header">
        <F1TeamLogo team={team} className="big" />
        <div>
          <h2>{team.name}</h2>
          <div className="team-sub">
            {team.base} · {team.powerUnit}
          </div>
        </div>
      </header>

      <section className="card">
        <h3>2026 season</h3>
        <div className="stat-grid">
          <Stat label="Championship position" value={`P${pos}`} />
          <Stat label="Points" value={team.points} />
          <Stat label="Power unit" value={team.powerUnit} />
          <Stat label="Constructors’ titles" value={team.championships} />
        </div>

        <h4>Drivers</h4>
        {roster.map((d) => (
          <Link className="team-row" key={d.slug} to={`/f1/driver/${d.slug}`}>
            <span className="driver-num">{d.number}</span>
            <div className="team-row-main">
              <div className="team-row-name">
                {d.flag} {d.name}
              </div>
              <div className="team-row-sub">
                {d.points} pts · {d.wins} wins · {d.podiums} podiums
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="card">
        <h3>Did you know?</h3>
        <ul className="facts">
          {team.facts.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </section>

      <p className="f1-note">Sample placeholder data — not live results.</p>
    </div>
  )
}

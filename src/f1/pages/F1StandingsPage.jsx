import { Link } from 'react-router-dom'
import { driversByPoints, teamsByPoints, teamBySlug } from '../data'

export default function F1StandingsPage() {
  const drivers = driversByPoints()
  const teams = teamsByPoints()
  return (
    <div className="page">
      <p className="hint">2026 World Championship standings. Tap a driver or team for details.</p>

      <section className="card">
        <h2>Drivers’ Championship</h2>
        <table className="standings">
          <thead>
            <tr>
              <th className="pos">#</th>
              <th className="team-col">Driver</th>
              <th>Wins</th>
              <th className="pts">Pts</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d, i) => {
              const t = teamBySlug(d.team)
              return (
                <tr key={d.slug} className={i === 0 ? 'qualifying' : ''}>
                  <td className="pos">{i + 1}</td>
                  <td className="team-col">
                    <Link to={`/f1/driver/${d.slug}`}>
                      <span className="f1-swatch" style={{ background: t?.color }} /> {d.name}
                    </Link>
                    <div className="team-row-sub">{t?.short}</div>
                  </td>
                  <td>{d.wins}</td>
                  <td className="pts">{d.points}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2>Constructors’ Championship</h2>
        <table className="standings">
          <thead>
            <tr>
              <th className="pos">#</th>
              <th className="team-col">Team</th>
              <th className="pts">Pts</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t, i) => (
              <tr key={t.slug} className={i === 0 ? 'qualifying' : ''}>
                <td className="pos">{i + 1}</td>
                <td className="team-col">
                  <Link to={`/f1/team/${t.slug}`}>
                    <span className="f1-swatch" style={{ background: t.color }} /> {t.name}
                  </Link>
                </td>
                <td className="pts">{t.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="f1-note">Sample placeholder data — not live results.</p>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { useF1Data } from '../lib/data.jsx'
import { driversByPoints, constructorsByPoints, constructorById } from '../lib/select'

export default function F1StandingsPage() {
  const { model } = useF1Data()
  const drivers = driversByPoints(model)
  const teams = constructorsByPoints(model)
  const colorOf = (cid) => constructorById(model, cid)?.color

  return (
    <div className="page">
      <p className="hint">{model.season} World Championship standings. Tap a driver or team for details.</p>

      <section className="card">
        <h2>Drivers’ Championship</h2>
        <p className="hint">
          Every driver ranked by total points scored this season. Drivers earn points by
          finishing in the top 10 of each Grand Prix — 25 for a win down to 1 for tenth (Sprint
          races award a few more) — so the leader is the current favourite for the world title.
        </p>
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
            {drivers.map((d, i) => (
              <tr key={d.driverId} className={i === 0 ? 'qualifying' : ''}>
                <td className="pos">{i + 1}</td>
                <td className="team-col">
                  <Link to={`/f1/driver/${d.driverId}`}>
                    <span className="f1-swatch" style={{ background: colorOf(d.constructorId) }} /> {d.name}
                  </Link>
                  <div className="team-row-sub">{d.constructorName}</div>
                </td>
                <td>{d.wins}</td>
                <td className="pts">{d.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2>Constructors’ Championship</h2>
        <p className="hint">
          The teams’ title. Each constructor’s score is its two drivers’ points added together,
          so it rewards the strongest car-and-team package overall. It runs alongside the drivers’
          championship and decides how prize money is shared out.
        </p>
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
              <tr key={t.constructorId} className={i === 0 ? 'qualifying' : ''}>
                <td className="pos">{i + 1}</td>
                <td className="team-col">
                  <Link to={`/f1/team/${t.constructorId}`}>
                    <span className="f1-swatch" style={{ background: t.color }} /> {t.name}
                  </Link>
                </td>
                <td className="pts">{t.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

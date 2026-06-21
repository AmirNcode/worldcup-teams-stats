import { Link } from 'react-router-dom'
import { useF1Data } from '../lib/data.jsx'
import { seasonStats, driverById } from '../lib/select'

export default function F1StatsPage() {
  const { model } = useF1Data()
  const s = seasonStats(model)
  const dName = (id) => driverById(model, id)?.name ?? id

  // Each record: emoji, the holder (driver/team) + a link, the label, the value.
  const records = [
    s.leader && { emoji: '🥇', who: s.leader.name, to: `/f1/driver/${s.leader.driverId}`, label: 'Championship leader', val: `${s.leader.points} pts` },
    s.mostWins && s.mostWins.wins > 0 && { emoji: '🏆', who: s.mostWins.name, to: `/f1/driver/${s.mostWins.driverId}`, label: 'Most wins', val: `${s.mostWins.wins}` },
    s.mostPodiums && { emoji: '🍾', who: dName(s.mostPodiums.id), to: `/f1/driver/${s.mostPodiums.id}`, label: 'Most podiums', val: `${s.mostPodiums.n}` },
    s.mostPoles && { emoji: '⏱️', who: dName(s.mostPoles.id), to: `/f1/driver/${s.mostPoles.id}`, label: 'Most pole positions', val: `${s.mostPoles.n}` },
    s.mostFastestLaps && { emoji: '💨', who: dName(s.mostFastestLaps.id), to: `/f1/driver/${s.mostFastestLaps.id}`, label: 'Most fastest laps', val: `${s.mostFastestLaps.n}` },
    s.bestClimb && { emoji: '📈', who: dName(s.bestClimb.driverId), to: `/f1/driver/${s.bestClimb.driverId}`, label: `Biggest climb · ${s.bestClimb.name}`, val: `+${s.bestClimb.gained} pos` },
    s.mostDnfs && { emoji: '🛠️', who: dName(s.mostDnfs.id), to: `/f1/driver/${s.mostDnfs.id}`, label: 'Most retirements (DNF)', val: `${s.mostDnfs.n}` },
    s.topConstructor && { emoji: '🏭', who: s.topConstructor.name, to: `/f1/team/${s.topConstructor.constructorId}`, label: 'Leading constructor', val: `${s.topConstructor.points} pts` },
  ].filter(Boolean)

  return (
    <div className="page">
      <p className="hint">
        Season records so far — {s.racesDone} of {s.racesTotal} rounds completed.
      </p>
      <section className="card">
        <h2>Season records</h2>
        {s.racesDone === 0 ? (
          <p className="hint">Records will appear once the season is under way.</p>
        ) : (
          <div className="team-list">
            {records.map((r, i) => (
              <Link className="team-row" key={i} to={r.to}>
                <span className="driver-num">{r.emoji}</span>
                <div className="team-row-main">
                  <div className="team-row-name">{r.who}</div>
                  <div className="team-row-sub">{r.label}</div>
                </div>
                <div className="team-row-tags">
                  <span className="title-badge">{r.val}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      <p className="f1-note">Records from completed rounds (Jolpica data).</p>
    </div>
  )
}

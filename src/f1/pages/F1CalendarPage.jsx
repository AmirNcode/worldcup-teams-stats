import { Link } from 'react-router-dom'
import { calendar, driverBySlug, circuitBySlug, fmtRoundDate } from '../data'

export default function F1CalendarPage() {
  return (
    <div className="page">
      <p className="hint">2026 race calendar. Completed rounds show the winner; tap a round for the circuit.</p>
      <div className="team-list">
        {calendar.map((r) => {
          const c = circuitBySlug(r.circuitSlug)
          const winner = r.result ? driverBySlug(r.result[0]) : null
          return (
            <Link className="team-row" key={r.round} to={`/f1/circuit/${r.circuitSlug}`}>
              <span className="driver-num">{r.round}</span>
              <div className="team-row-main">
                <div className="team-row-name">{r.name}</div>
                <div className="team-row-sub">
                  {c ? `${c.flag} ${c.locality}` : ''} · {fmtRoundDate(r.date)}
                </div>
              </div>
              <div className="team-row-tags">
                {winner ? (
                  <span className="title-badge">🏆 {winner.name}</span>
                ) : r.status === 'next' ? (
                  <span className="debut-badge">Next</span>
                ) : (
                  <span className="team-row-sub">Upcoming</span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
      <p className="f1-note">Sample placeholder data — not a real schedule.</p>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { useF1Data } from '../lib/data.jsx'
import { rounds, nextRound, driverById, circuitById } from '../lib/select'
import { fmtDate, fmtTime, tzLabel } from '../../lib/format'

const sourceNote = (source) =>
  source === 'live' ? 'Live data via Jolpica.' : source === 'cache' ? 'Cached Jolpica data.' : 'Bundled snapshot.'

export default function F1CalendarPage() {
  const { model, source } = useF1Data()
  const list = rounds(model)
  const next = nextRound(model)
  return (
    <div className="page">
      <p className="hint">
        {model.season} race calendar. Start times are shown in your local time zone. Tap a round for the circuit.
      </p>
      <div className="team-list">
        {list.map((r) => {
          const c = circuitById(model, r.circuitId)
          const winner = r.winnerId ? driverById(model, r.winnerId) : null
          const to = r.done ? `/f1/race/${r.round}` : `/f1/circuit/${r.circuitId}`
          return (
            <Link className="team-row" key={r.round} to={to}>
              <span className="driver-num">{r.round}</span>
              <div className="team-row-main">
                <div className="team-row-name">{r.name}</div>
                <div className="team-row-sub">{c ? `${c.flag} ${c.locality ?? c.country ?? ''}` : ''}</div>
                <div className="team-row-sub">
                  {fmtDate(r.start)} · {fmtTime(r.start)}
                </div>
              </div>
              <div className="team-row-tags">
                {winner ? (
                  <span className="title-badge">🏆 {winner.name}</span>
                ) : next && r.round === next.round ? (
                  <span className="debut-badge">Next</span>
                ) : (
                  <span className="team-row-sub">Upcoming</span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
      <p className="f1-note">
        Times in your zone ({tzLabel()}). {sourceNote(source)}
      </p>
    </div>
  )
}

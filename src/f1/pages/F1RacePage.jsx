import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useF1Data } from '../lib/data.jsx'
import { roundByNumber, driverById, constructorById } from '../lib/select'
import { fmtDate, fmtTime } from '../../lib/format'
import {
  raceSessionsUrl,
  driversUrl,
  pitUrl,
  stintsUrl,
  parseSessions,
  raceSessionKeyForDate,
  parseDrivers,
  parsePits,
  parseStints,
  numberToDriverId,
} from '../lib/openf1'

const TYRE = { SOFT: 'S', MEDIUM: 'M', HARD: 'H', INTERMEDIATE: 'I', WET: 'W' }

function Stat({ label, value }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

function Tyres({ compounds }) {
  if (!compounds || compounds.length === 0) return null
  return (
    <span className="tyres">
      {compounds.map((c, i) => (
        <span key={i} className={`tyre tyre-${TYRE[c] ?? 'x'}`} title={c}>
          {TYRE[c] ?? '?'}
        </span>
      ))}
    </span>
  )
}

export default function F1RacePage() {
  const { round } = useParams()
  const { model } = useF1Data()
  const r = roundByNumber(model, round)
  // null = loading, 'none' = unavailable, object = { pitById, tyresById }
  const [extra, setExtra] = useState(null)

  useEffect(() => {
    if (!r || !r.done) return
    let alive = true
    setExtra(null)
    ;(async () => {
      try {
        const sessions = parseSessions(await fetch(raceSessionsUrl(model.season)).then((x) => x.json()))
        const sk = raceSessionKeyForDate(sessions, r.date)
        if (!sk) {
          if (alive) setExtra('none')
          return
        }
        // Fetch sequentially to stay under OpenF1's free-tier rate limit (3 req/s);
        // a burst of parallel calls can be throttled and come back non-array.
        const n2id = numberToDriverId(parseDrivers(await fetch(driversUrl(sk)).then((x) => x.json())), model.drivers)
        const pits = parsePits(await fetch(pitUrl(sk)).then((x) => x.json()))
        const stints = parseStints(await fetch(stintsUrl(sk)).then((x) => x.json()))
        const pitById = {}
        const tyresById = {}
        for (const [num, id] of Object.entries(n2id)) {
          if (pits[num]) pitById[id] = pits[num]
          if (stints[num]) tyresById[id] = stints[num]
        }
        const hasData = Object.keys(pitById).length > 0 || Object.keys(tyresById).length > 0
        if (alive) setExtra(hasData ? { pitById, tyresById } : 'none')
      } catch {
        if (alive) setExtra('none')
      }
    })()
    return () => {
      alive = false
    }
  }, [r?.round, r?.date, r?.done, model.season])

  if (!r) {
    return (
      <div className="page">
        <p className="hint">Race not found.</p>
        <Link to="/f1">← Calendar</Link>
      </div>
    )
  }

  const nameOf = (id) => (id ? driverById(model, id)?.family ?? '—' : '—')

  return (
    <div className="page">
      <header className="team-header">
        <span className="driver-num">{r.round}</span>
        <div>
          <h2>{r.name}</h2>
          <div className="team-sub">
            <Link to={`/f1/circuit/${r.circuitId}`}>{r.circuitName ?? r.locality}</Link> · {fmtDate(r.start)},{' '}
            {fmtTime(r.start)}
          </div>
        </div>
      </header>

      {!r.done ? (
        <section className="card">
          <p className="hint">This round hasn’t been raced yet.</p>
          <Link className="compare-link" to={`/f1/circuit/${r.circuitId}`}>
            🏟️ Preview the circuit →
          </Link>
        </section>
      ) : (
        <>
          <section className="card">
            <h3>Race summary</h3>
            <div className="stat-grid three">
              <Stat label="Winner" value={nameOf(r.winnerId)} />
              <Stat label="Pole" value={nameOf(r.poleId)} />
              <Stat label="Fastest lap" value={nameOf(r.fastestLapDriverId)} />
            </div>
          </section>

          <section className="card">
            <h3>Classification</h3>
            <div className="team-list">
              {(r.results ?? []).map((row) => {
                const d = driverById(model, row.driverId)
                const team = constructorById(model, row.constructorId)
                const pit = extra && extra !== 'none' ? extra.pitById[row.driverId] : null
                const tyres = extra && extra !== 'none' ? extra.tyresById[row.driverId] : null
                const dnf = row.status && row.status !== 'Finished' && !/^\+/.test(row.status)
                return (
                  <div className="team-row" key={row.driverId}>
                    <span className={`driver-num${row.pos === 1 ? ' f1-win' : ''}`}>{row.pos}</span>
                    <div className="team-row-main">
                      <div className="team-row-name">
                        <Link to={`/f1/driver/${row.driverId}`}>{d ? `${d.flag} ${d.name}` : row.driverId}</Link>
                      </div>
                      <div className="team-row-sub">
                        <span className="f1-swatch" style={{ background: team?.color }} /> {team?.name ?? row.constructorId}
                        {dnf ? ` · ${row.status}` : ''}
                      </div>
                      {(row.time || row.fastestLap) && (
                        <div className="team-row-sub">
                          {row.time ? `🏁 ${row.time}` : ''}
                          {row.time && row.fastestLap ? ' · ' : ''}
                          {row.fastestLap ? `⏱ ${row.fastestLap}` : ''}
                        </div>
                      )}
                      {(tyres || pit) && (
                        <div className="team-row-sub">
                          <Tyres compounds={tyres} />
                          {pit ? ` ${pit.stops} stop${pit.stops === 1 ? '' : 's'}` : ''}
                          {pit?.best ? ` · best ${pit.best.toFixed(1)}s` : ''}
                        </div>
                      )}
                    </div>
                    <div className="team-row-tags">
                      <span className="title-badge">{row.points} pts</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="f1-note">
              {extra === null
                ? 'Loading pit stops & tyre strategy from OpenF1…'
                : extra === 'none'
                  ? 'Classification via Jolpica. Pit/tyre detail unavailable for this race.'
                  : 'Classification via Jolpica · pit stops & tyres via OpenF1.'}
            </p>
          </section>
        </>
      )}
    </div>
  )
}

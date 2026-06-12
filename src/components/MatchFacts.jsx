import { useEffect, useState } from 'react'
import teams from '../data/teams.json'
import { fetchMatchFacts } from '../lib/espn'
import { matchStatus, finalScore } from '../lib/data.jsx'
import { STADIUMS, fmtDateLong, fmtTime, shortCity } from '../lib/format'

function GoalTimeline({ match }) {
  const rows = []
  for (const [goals, team, side] of [
    [match.goals1, match.team1, 'a'],
    [match.goals2, match.team2, 'b'],
  ]) {
    for (const g of goals ?? []) rows.push({ ...g, team, side })
  }
  if (rows.length === 0) return null
  rows.sort((x, y) => (x.minute ?? 0) - (y.minute ?? 0))
  return (
    <div className="facts-goals">
      {rows.map((g, i) => (
        <div key={i} className={`facts-goal ${g.side}`}>
          <span>
            ⚽ {g.name}
            {g.minute != null ? ` ${g.minute}'` : ''}
            {g.penalty ? ' (pen)' : ''}
            {g.owngoal ? ' (og)' : ''}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function MatchFacts({ match, onClose }) {
  const [facts, setFacts] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let alive = true
    if (match.espnId) {
      fetchMatchFacts(match)
        .then((f) => alive && setFacts(f))
        .catch(() => alive && setError(true))
    } else {
      setError(true)
    }
    return () => {
      alive = false
    }
  }, [match])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  const status = matchStatus(match)
  const score = finalScore(match) ?? match.score?.ht
  const ht = match.score?.ht
  const pens = match.score?.p
  const t1 = teams[match.team1]
  const t2 = teams[match.team2]
  const stadium = STADIUMS[match.city]
  const hasStats = facts && facts.stats.length > 0

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="sheet-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div className="sheet-head">
          <div className="sheet-team">
            <span className="flag big">{t1?.flag ?? '·'}</span>
            <span>{match.team1}</span>
          </div>
          <div className="sheet-score">
            {score ? (
              <>
                <div className="score">
                  {score[0]} – {score[1]}
                </div>
                {pens && (
                  <div className="score-note">
                    {pens[0]}–{pens[1]} pens
                  </div>
                )}
                {status === 'ft' && ht && (
                  <div className="score-note">HT {ht[0]} – {ht[1]}</div>
                )}
                {status === 'ht' && <div className="score-note">Half-time</div>}
                {status === '2h' && <div className="score-note">HT score · 2nd half in play</div>}
              </>
            ) : (
              <div className="kickoff-time">{fmtTime(match.kickoff)}</div>
            )}
          </div>
          <div className="sheet-team">
            <span className="flag big">{t2?.flag ?? '·'}</span>
            <span>{match.team2}</span>
          </div>
        </div>

        <GoalTimeline match={match} />

        {hasStats ? (
          <table className="facts-stats">
            <tbody>
              {facts.stats.map((s, i) => (
                <tr key={i}>
                  <td className="va">{s.a}</td>
                  <th>{s.label}</th>
                  <td className="vb">{s.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : error ? (
          <p className="hint center">
            Detailed stats aren’t available for this match (yet).
          </p>
        ) : (
          <p className="hint center">Loading match stats…</p>
        )}

        <div className="facts-info">
          {(facts?.info ?? []).map(([k, v]) => (
            <div key={k}>
              <strong>{k}:</strong> {v}
            </div>
          ))}
          {!facts?.info?.some(([k]) => k === 'Venue') && (
            <div>
              <strong>Venue:</strong> {stadium ? `${stadium}, ` : ''}
              {shortCity(match.city)}
            </div>
          )}
          <div>
            <strong>Date:</strong> {fmtDateLong(match.kickoff)} · {fmtTime(match.kickoff)}
          </div>
        </div>
      </div>
    </div>
  )
}

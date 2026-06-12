import { useState } from 'react'
import TeamTag from './TeamTag'
import MatchFacts from './MatchFacts'
import { matchStatus, finalScore } from '../lib/data.jsx'
import { STADIUMS, fmtTime, fmtDate, shortCity } from '../lib/format'

const BADGES = {
  ft: ['FT', 'ft'],
  ht: ['HT', 'ht'],
  '1h': ['1st half', 'live'],
  '2h': ['2nd half', 'live'],
  et: ['Extra time', 'live'],
  pens: ['Penalties', 'live'],
  live: ['In play', 'live'],
  pending: ['Result pending', 'pending'],
}

function StatusBadge({ status }) {
  const b = BADGES[status]
  return b ? <span className={`badge ${b[1]}`}>{b[0]}</span> : null
}

export default function MatchCard({ match, showDate = false, highlight = false }) {
  const [factsOpen, setFactsOpen] = useState(false)
  const status = matchStatus(match)
  const score = finalScore(match)
  const ht = match.score?.ht
  const pens = match.score?.p

  // Tapping the card opens match facts once there's something to show;
  // team names (links inside) still navigate to team pages.
  const openable =
    status !== 'upcoming' &&
    Boolean(match.espnId || score || ht || match.goals1?.length || match.goals2?.length)

  const label = match.group ? `Group ${match.group}` : match.round
  const stadium = STADIUMS[match.city]

  return (
    <>
      <div
        className={`match-card${highlight ? ' fav' : ''}${openable ? ' tappable' : ''}`}
        onClick={openable ? () => setFactsOpen(true) : undefined}
      >
        <div className="match-meta">
          <span>
            {label}
            {match.matchNumber ? ` · M${match.matchNumber}` : ''}
          </span>
          <span>
            {stadium ? `${stadium}, ` : ''}
            {shortCity(match.city)}
          </span>
        </div>
        <div className="match-main">
          <div className="side home" onClick={(e) => e.stopPropagation()}>
            <TeamTag name={match.team1} bold />
          </div>
          <div className="center">
            {score ? (
              <>
                <div className="score">
                  {score[0]} – {score[1]}
                </div>
                {pens ? (
                  <div className="score-note">
                    {pens[0]}–{pens[1]} pens
                  </div>
                ) : match.score?.et ? (
                  <div className="score-note">aet</div>
                ) : null}
              </>
            ) : ht ? (
              <>
                <div className="score">
                  {ht[0]} – {ht[1]}
                </div>
                {status === '2h' && <div className="score-note">HT score</div>}
              </>
            ) : (
              <div className="kickoff">
                {showDate && <div className="kickoff-date">{fmtDate(match.kickoff)}</div>}
                <div className="kickoff-time">{fmtTime(match.kickoff)}</div>
              </div>
            )}
            <StatusBadge status={status} />
          </div>
          <div className="side away" onClick={(e) => e.stopPropagation()}>
            <TeamTag name={match.team2} bold />
          </div>
        </div>
        {openable && <div className="match-foot">Match facts ›</div>}
      </div>
      {factsOpen && <MatchFacts match={match} onClose={() => setFactsOpen(false)} />}
    </>
  )
}

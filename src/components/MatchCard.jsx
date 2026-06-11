import { useState } from 'react'
import TeamTag from './TeamTag'
import { matchStatus, finalScore } from '../lib/data.jsx'
import { STADIUMS, fmtTime, fmtDate, shortCity } from '../lib/format'

function StatusBadge({ status }) {
  if (status === 'ft') return <span className="badge ft">FT</span>
  if (status === 'ht') return <span className="badge ht">HT</span>
  if (status === 'live') return <span className="badge live">In play</span>
  if (status === 'pending') return <span className="badge pending">Result pending</span>
  return null
}

function GoalList({ goals, align }) {
  if (!goals || goals.length === 0) return <div className={`goals ${align}`} />
  return (
    <div className={`goals ${align}`}>
      {goals.map((g, i) => (
        <div key={i} className="goal">
          ⚽ {g.name} {g.minute}'{g.penalty ? ' (pen)' : ''}
          {g.owngoal ? ' (og)' : ''}
        </div>
      ))}
    </div>
  )
}

export default function MatchCard({ match, showDate = false, highlight = false }) {
  const status = matchStatus(match)
  const score = finalScore(match)
  const ht = match.score?.ht
  const pens = match.score?.p
  const hasDetail = (match.goals1?.length || match.goals2?.length || ht) && score
  const [open, setOpen] = useState(false)

  const label = match.group ? `Group ${match.group}` : match.round
  const stadium = STADIUMS[match.city]

  return (
    <div
      className={`match-card${highlight ? ' fav' : ''}${hasDetail ? ' tappable' : ''}`}
      onClick={hasDetail ? () => setOpen((o) => !o) : undefined}
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
        <div className="side home">
          <TeamTag name={match.team1} bold />
        </div>
        <div className="center">
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
              {!pens && match.score?.et && <div className="score-note">aet</div>}
            </>
          ) : status === 'ht' ? (
            <div className="score">
              {ht[0]} – {ht[1]}
            </div>
          ) : (
            <div className="kickoff">
              {showDate && <div className="kickoff-date">{fmtDate(match.kickoff)}</div>}
              <div className="kickoff-time">{fmtTime(match.kickoff)}</div>
            </div>
          )}
          <StatusBadge status={status} />
        </div>
        <div className="side away">
          <TeamTag name={match.team2} bold />
        </div>
      </div>
      {hasDetail && (
        <div className="match-foot">{open ? '▲ hide details' : '▼ goals & details'}</div>
      )}
      {open && hasDetail && (
        <div className="match-detail" onClick={(e) => e.stopPropagation()}>
          {ht && score && (
            <div className="ht-line">
              Half-time: {ht[0]} – {ht[1]}
            </div>
          )}
          <div className="goal-cols">
            <GoalList goals={match.goals1} align="left" />
            <GoalList goals={match.goals2} align="right" />
          </div>
        </div>
      )}
    </div>
  )
}

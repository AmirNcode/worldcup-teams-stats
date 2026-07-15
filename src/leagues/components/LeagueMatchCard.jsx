import { Link } from 'react-router-dom'
import { fmtDateLong, fmtTime, dayKey } from '../../lib/format'

// League match cards in the World Cup card layout: the venue centered on the
// card's top line, teams left/right with the score or local kickoff time in
// the middle (.match-main). Team names link to their club page (styled like
// plain text — no accent). The day itself lives OUTSIDE the cards — use
// LeagueMatchDays to group a list by local date with one heading per day.
function Side({ league, team, away }) {
  const body = (
    <>
      {!away && team.logo && <img src={team.logo} alt="" loading="lazy" />}
      <b>{team.name}</b>
      {away && team.logo && <img src={team.logo} alt="" loading="lazy" />}
    </>
  )
  return team.id ? (
    <Link className={`league-tag${away ? ' away' : ''}`} to={`/leagues/${league}/team/${team.id}`}>
      {body}
    </Link>
  ) : (
    <span className={`league-tag${away ? ' away' : ''}`}>{body}</span>
  )
}

export function LeagueMatchCard({ league, m }) {
  const played = m.state === 'post'
  return (
    <div className="match-card">
      {m.venue && (
        <div className="match-meta league-venue">
          <span>{m.venue}</span>
        </div>
      )}
      <div className="match-main">
        <div className="side home">
          <Side league={league} team={m.home} />
        </div>
        <div className="center">
          {played ? (
            <>
              <div className="score">
                {m.home.score} – {m.away.score}
              </div>
              <span className="badge ft">FT</span>
            </>
          ) : (
            <div className="kickoff">
              <div className="kickoff-time">{fmtTime(m.date)}</div>
            </div>
          )}
        </div>
        <div className="side away">
          <Side league={league} team={m.away} away />
        </div>
      </div>
    </div>
  )
}

// A match list grouped by local calendar day, one date heading per day
// (same structure as the World Cup schedule list view).
export function LeagueMatchDays({ league, matches }) {
  const byDay = new Map()
  for (const m of matches) {
    const k = dayKey(m.date)
    if (!byDay.has(k)) byDay.set(k, { date: m.date, list: [] })
    byDay.get(k).list.push(m)
  }
  return [...byDay.values()].map(({ date, list }) => (
    <div key={dayKey(date)}>
      <h3 className="date-header">{fmtDateLong(date)}</h3>
      {list.map((m) => (
        <LeagueMatchCard key={m.id} league={league} m={m} />
      ))}
    </div>
  ))
}

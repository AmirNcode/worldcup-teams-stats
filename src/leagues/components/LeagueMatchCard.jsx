import { fmtDateLong, fmtTime, dayKey } from '../../lib/format'

// League match cards in the World Cup card layout: venue on the card's top
// right (.match-meta), teams left/right with the score or local kickoff time
// in the middle (.match-main). The day itself lives OUTSIDE the cards — use
// LeagueMatchDays to group a list by local date with one heading per day.
export function LeagueMatchCard({ m }) {
  const played = m.state === 'post'
  return (
    <div className="match-card">
      <div className="match-meta">
        <span />
        <span>{m.venue ?? ''}</span>
      </div>
      <div className="match-main">
        <div className="side home">
          <span className="league-tag">
            {m.home.logo && <img src={m.home.logo} alt="" loading="lazy" />}
            <b>{m.home.name}</b>
          </span>
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
          <span className="league-tag away">
            <b>{m.away.name}</b>
            {m.away.logo && <img src={m.away.logo} alt="" loading="lazy" />}
          </span>
        </div>
      </div>
    </div>
  )
}

// A match list grouped by local calendar day, one date heading per day
// (same structure as the World Cup schedule list view).
export function LeagueMatchDays({ matches }) {
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
        <LeagueMatchCard key={m.id} m={m} />
      ))}
    </div>
  ))
}

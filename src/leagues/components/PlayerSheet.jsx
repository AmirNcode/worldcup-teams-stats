import { useEffect } from 'react'
import { useLeaguePlayer } from '../lib/data.jsx'
import { playerFacts } from '../data/players'

// Bottom-sheet bio for a scorer on the Boot tab (same sheet pattern as the
// World Cup match facts). `row` is the tapped leaders row — its goals/assists
// numbers describe the season shown on the page, while the live athlete bio
// (club, age, nationality, position) comes from ESPN when the sheet opens.
export default function PlayerSheet({ league, row, kind, onClose }) {
  const bio = useLeaguePlayer(league, row.id)
  const facts = playerFacts(row.id)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const perMatch = row.matches ? (row.value / row.matches).toFixed(2) : null
  const bioRows = bio
    ? [
        ['Club', bio.team, bio.teamLogo],
        ['Country', bio.citizenship, bio.flag],
        ['Position', bio.position, null],
        ['Age', bio.age, null],
        ['Shirt', bio.jersey ? `#${bio.jersey}` : null, null],
        ['Height', bio.height, null],
      ].filter(([, v]) => v != null)
    : []

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="sheet-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h3 className="player-sheet-name">{row.name}</h3>
        <div className="player-sheet-stats">
          <span>
            {kind === 'assists' ? 'Assists' : 'Goals'} <b>{row.value}</b>
          </span>
          <span>
            Matches <b>{row.matches ?? '—'}</b>
          </span>
          {perMatch && (
            <span>
              Per match <b>{perMatch}</b>
            </span>
          )}
        </div>
        {bio ? (
          <div className="player-sheet-bio">
            {bioRows.map(([label, value, icon]) => (
              <div className="player-sheet-row" key={label}>
                <span className="muted">{label}</span>
                <span>
                  {icon && <img src={icon} alt="" loading="lazy" />}
                  {value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Loading player details…</p>
        )}
        {facts && (
          <>
            <h4>Fun facts</h4>
            <ul className="league-facts">
              {facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

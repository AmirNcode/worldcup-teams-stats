import { useNavigate } from 'react-router-dom'
import { LEAGUES } from '../lib/leagues'
import { track } from '../../lib/analytics'

// Horizontal chip row for switching leagues. Navigation preserves the current
// page kind: picking a league from the fixtures page lands on that league's
// fixtures. The URL stays the single source of truth for the active league.
export default function LeaguePicker({ active, page = '' }) {
  const navigate = useNavigate()
  return (
    <div className="league-picker" role="tablist" aria-label="League">
      {LEAGUES.map((l) => (
        <button
          key={l.id}
          role="tab"
          aria-selected={l.id === active}
          className={l.id === active ? 'league-chip active' : 'league-chip'}
          onClick={() => {
            if (l.id === active) return
            track('league_viewed', { league: l.id })
            navigate(`/leagues/${l.id}${page}`)
          }}
        >
          <span>{l.flag}</span> {l.name}
        </button>
      ))}
    </div>
  )
}

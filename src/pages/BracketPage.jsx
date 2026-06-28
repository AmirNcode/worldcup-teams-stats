import { Fragment, useMemo, useState } from 'react'
import { useData } from '../lib/data.jsx'
import { bracketRankings } from '../lib/standings'
import { track } from '../lib/analytics'
import MatchCard from '../components/MatchCard'
import TeamTag from '../components/TeamTag'

const ROUNDS = [
  ['r32', 'Round of 32'],
  ['r16', 'Round of 16'],
  ['qf', 'Quarter-finals'],
  ['sf', 'Semi-finals'],
  ['third', 'Third place'],
  ['final', 'Final'],
]

// Collapsed by default: a live projection of all 48 teams ranked, with a
// divider marking who currently holds one of the 32 Round of 32 spots.
function RankingsSection({ matches }) {
  const [open, setOpen] = useState(false)
  const { qualified, eliminated } = useMemo(() => bracketRankings(matches), [matches])
  const ranked = [...qualified, ...eliminated]
  const cutoff = qualified.length

  const toggle = () => {
    const next = !open
    setOpen(next)
    track('bracket_rankings_toggled', { open: next })
  }

  return (
    <section className="card rankings">
      <button
        type="button"
        className="rankings-head"
        aria-expanded={open}
        onClick={toggle}
      >
        <span className="rankings-title">Round of 32 rankings</span>
        <span className="chevron" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
      </button>
      {open && (
        <div className="rankings-body">
          <p className="hint">
            All 48 teams ranked by points, then goal difference, then goals
            scored. The {cutoff} teams above the line currently hold a Round of
            32 spot (top 2 of each group + the 8 best third-placed teams) — a
            live projection until the group stage finishes.
          </p>
          <table className="standings rankings-table">
            <thead>
              <tr>
                <th className="pos">#</th>
                <th className="team-col">Team</th>
                <th>Grp</th>
                <th>Pts</th>
                <th>GD</th>
                <th>GF</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((r, i) => (
                <Fragment key={r.team}>
                  {i === cutoff && (
                    <tr className="cutoff">
                      <td colSpan={6}>Round of 32 cutoff</td>
                    </tr>
                  )}
                  <tr className={r.qualified ? 'qualifying' : ''}>
                    <td className="pos">{i + 1}</td>
                    <td className="team-col">
                      <TeamTag name={r.team} />
                    </td>
                    <td>{r.group}</td>
                    <td className="pts">{r.pts}</td>
                    <td>{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
                    <td>{r.gf}</td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default function BracketPage() {
  const { matches } = useData()
  const byStage = useMemo(() => {
    const map = {}
    for (const m of matches) {
      if (m.stage === 'group') continue
      ;(map[m.stage] ??= []).push(m)
    }
    for (const list of Object.values(map)) {
      list.sort((a, b) => (a.matchNumber ?? 0) - (b.matchNumber ?? 0))
    }
    return map
  }, [matches])

  return (
    <div className="page">
      <p className="hint">
        Slots fill in automatically as the group stage and earlier rounds finish.
        “Winner of Match N” refers to the match numbers shown on each card.
      </p>
      <RankingsSection matches={matches} />
      {ROUNDS.map(([stage, label]) => (
        <section key={stage} className="bracket-round">
          <h2>{label}</h2>
          {(byStage[stage] ?? []).map((m) => (
            <MatchCard key={m.key} match={m} showDate />
          ))}
        </section>
      ))}
    </div>
  )
}

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useData, matchStatus } from '../lib/data.jsx'
import { tournamentRankings } from '../lib/standings'
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

// Collapsed by default: a whole-tournament power ranking of all 48 teams with a
// divider marking the teams still in it. The line is the Round of 32 projection
// during the group stage, and real elimination once the knockouts begin.
function RankingsSection({ matches }) {
  const [open, setOpen] = useState(false)
  const { ranked, cutoff, dividerLabel } = useMemo(
    () => tournamentRankings(matches),
    [matches],
  )

  const toggle = () => {
    const next = !open
    setOpen(next)
    track('bracket_rankings_toggled', { open: next })
  }

  return (
    <section className="card rankings">
      <button
        type="button"
        className="collapse-head"
        aria-expanded={open}
        onClick={toggle}
      >
        <span className="collapse-title">Tournament rankings</span>
        <span className="chevron" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
      </button>
      {open && (
        <div className="rankings-body">
          <p className="hint">
            Every team ranked by how far they've gone, then points, goal
            difference and goals scored across the whole tournament. Teams above
            the line are still in it (a Round of 32 spot during the group stage);
            below the line are out. Updates live as results come in.
          </p>
          <table className="standings rankings-table">
            <thead>
              <tr>
                <th className="pos">#</th>
                <th className="team-col">Team</th>
                <th>MP</th>
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
                      <td colSpan={6}>{dividerLabel}</td>
                    </tr>
                  )}
                  <tr className={r.out ? '' : 'qualifying'}>
                    <td className="pos">{i + 1}</td>
                    <td className="team-col">
                      <TeamTag name={r.team} />
                    </td>
                    <td>{r.mp}</td>
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

// One knockout round. Expanded by default while any of its matches is still to
// be played; collapses to its header by default once the last match is final.
// A manual toggle sticks — after that the user's choice wins over the default.
function RoundSection({ stage, label, matches }) {
  const complete = matches.length > 0 && matches.every((m) => matchStatus(m) === 'ft')
  const [open, setOpen] = useState(!complete)
  const touched = useRef(false)

  useEffect(() => {
    if (!touched.current) setOpen(!complete)
  }, [complete])

  const toggle = () => {
    touched.current = true
    const next = !open
    setOpen(next)
    track('bracket_round_toggled', { round: stage, open: next })
  }

  return (
    <section className="bracket-round">
      <button
        type="button"
        className="collapse-head round-head"
        aria-expanded={open}
        onClick={toggle}
      >
        <span className="collapse-title">{label}</span>
        <span className="chevron" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
      </button>
      {open && matches.map((m) => <MatchCard key={m.key} match={m} showDate />)}
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
      <RankingsSection matches={matches} />
      <h2 className="section-title rounds-title">Knockout bracket</h2>
      <p className="hint">
        Slots fill in automatically as the group stage and earlier rounds finish.
        “Winner of Match N” refers to the match numbers shown on each card.
      </p>
      {ROUNDS.map(([stage, label]) => (
        <RoundSection key={stage} stage={stage} label={label} matches={byStage[stage] ?? []} />
      ))}
    </div>
  )
}

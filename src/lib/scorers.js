// Golden Boot tally across all played matches. Own goals don't count toward
// a player's total (matching FIFA's rules).
export function goldenBoot(matches) {
  const tally = new Map()
  for (const m of matches) {
    for (const [goals, team] of [
      [m.goals1, m.team1],
      [m.goals2, m.team2],
    ]) {
      if (!goals) continue
      for (const g of goals) {
        if (g.owngoal) continue
        const k = `${g.name}|${team}`
        const e = tally.get(k) ?? { name: g.name, team, goals: 0, pens: 0 }
        e.goals++
        if (g.penalty) e.pens++
        tally.set(k, e)
      }
    }
  }
  return [...tally.values()].sort(
    (a, b) => b.goals - a.goals || a.pens - b.pens || a.name.localeCompare(b.name),
  )
}

// Every goal involving a team's matches, flattened for the team page:
// [{ name, minute, penalty, owngoal, forTeam, match }]
export function teamGoals(matches, team) {
  const out = []
  for (const m of matches) {
    if (m.team1 !== team && m.team2 !== team) continue
    for (const [goals, forTeam] of [
      [m.goals1, m.team1],
      [m.goals2, m.team2],
    ]) {
      if (!goals) continue
      for (const g of goals) out.push({ ...g, forTeam, match: m })
    }
  }
  return out
}

export function tournamentTotals(matches) {
  let played = 0
  let goals = 0
  for (const m of matches) {
    const ft = m.score?.ft
    if (!ft) continue
    played++
    const [a, b] = m.score?.et ?? ft
    goals += a + b
  }
  return { played, goals }
}

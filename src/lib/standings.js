// Group tables computed from played group matches.
// Sort: points, goal difference, goals scored, then head-to-head result
// between fully tied pairs, then name. (FIFA's full procedure has more rungs,
// but these cover virtually every real table.)
export function computeGroups(matches) {
  const groups = {}
  const h2h = new Map() // "A|B" -> winner name or 'draw'

  for (const m of matches) {
    if (m.stage !== 'group') continue
    const g = (groups[m.group] ??= {})
    for (const t of [m.team1, m.team2]) {
      g[t] ??= { team: t, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 }
    }
    const ft = m.score?.ft
    if (!ft) continue
    const [a, b] = ft
    const t1 = g[m.team1]
    const t2 = g[m.team2]
    t1.mp++; t2.mp++
    t1.gf += a; t1.ga += b
    t2.gf += b; t2.ga += a
    if (a > b) { t1.w++; t2.l++; t1.pts += 3 }
    else if (a < b) { t2.w++; t1.l++; t2.pts += 3 }
    else { t1.d++; t2.d++; t1.pts++; t2.pts++ }
    h2h.set([m.team1, m.team2].sort().join('|'), a > b ? m.team1 : a < b ? m.team2 : 'draw')
  }

  const result = {}
  for (const [name, table] of Object.entries(groups)) {
    const rows = Object.values(table)
    for (const r of rows) r.gd = r.gf - r.ga
    rows.sort((x, y) => {
      if (y.pts !== x.pts) return y.pts - x.pts
      if (y.gd !== x.gd) return y.gd - x.gd
      if (y.gf !== x.gf) return y.gf - x.gf
      const winner = h2h.get([x.team, y.team].sort().join('|'))
      if (winner === x.team) return -1
      if (winner === y.team) return 1
      return x.team.localeCompare(y.team)
    })
    result[name] = rows
  }
  return result
}

// The 12 third-placed teams ranked by the FIFA criteria (points, GD, GF);
// the best 8 advance to the Round of 32.
export function thirdPlaceRace(groups) {
  return Object.entries(groups)
    .map(([group, rows]) => ({ group, ...rows[2] }))
    .filter((r) => r.team)
    .sort(
      (x, y) =>
        y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || x.team.localeCompare(y.team),
    )
}

// All teams ranked across groups by points, then goal difference, then goals
// for, then name — split into the teams currently holding a Round of 32 spot
// (top two of each group + the best 8 third-placed teams) and the rest. A live
// projection during the group stage; reads the same standings as the group
// tables, so an in-progress match (no score.ft) is not yet counted.
export function bracketRankings(matches) {
  const groups = computeGroups(matches)
  const qualified = new Set()
  for (const rows of Object.values(groups)) {
    if (rows[0]) qualified.add(rows[0].team)
    if (rows[1]) qualified.add(rows[1].team)
  }
  for (const r of thirdPlaceRace(groups).slice(0, 8)) qualified.add(r.team)

  const byRank = (x, y) =>
    y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || x.team.localeCompare(y.team)
  const all = []
  for (const [group, rows] of Object.entries(groups)) {
    for (const r of rows) all.push({ ...r, group, qualified: qualified.has(r.team) })
  }
  return {
    qualified: all.filter((r) => r.qualified).sort(byRank),
    eliminated: all.filter((r) => !r.qualified).sort(byRank),
  }
}

// One team's overall tournament record (group + knockout).
export function teamTournamentRecord(matches, team) {
  const rec = { mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 }
  for (const m of matches) {
    if (m.team1 !== team && m.team2 !== team) continue
    const ft = m.score?.ft
    if (!ft) continue
    const et = m.score?.et
    const [a, b] = et ?? ft
    const mine = m.team1 === team ? a : b
    const theirs = m.team1 === team ? b : a
    rec.mp++
    rec.gf += mine
    rec.ga += theirs
    if (mine > theirs) rec.w++
    else if (mine < theirs) rec.l++
    else rec.d++
  }
  return rec
}

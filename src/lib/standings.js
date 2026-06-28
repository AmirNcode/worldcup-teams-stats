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

// How deep each knockout stage is, for ranking by furthest round reached.
// 'third' (the third-place play-off) is a semi-final exit, so it ranks with sf.
const STAGE_RANK = { group: 0, r32: 1, r16: 2, qf: 3, third: 4, sf: 4, final: 5 }

// A whole-tournament power ranking that updates from the group stage through the
// final. Every team is ranked by furthest round reached, then tournament points
// (3/1/0 across all stages), goal difference, goals for, then name. The list is
// split by a cutoff line into the teams still in it and the teams that are out:
//   - During the group stage the line is the Round of 32 projection (top two of
//     each group + the best 8 third-placed teams) — a live forecast.
//   - Once the group stage is complete the line is real elimination: teams that
//     missed the Round of 32, or that have since lost a knockout tie, drop below.
// Reads the same finished-match data as the group tables, so an in-progress
// match (no score.ft) is never counted.
export function tournamentRankings(matches) {
  const groups = computeGroups(matches)

  // Who currently holds a Round of 32 spot — a projection until groups finish.
  const qualifiers = new Set()
  for (const rows of Object.values(groups)) {
    if (rows[0]) qualifiers.add(rows[0].team)
    if (rows[1]) qualifiers.add(rows[1].team)
  }
  for (const r of thirdPlaceRace(groups).slice(0, 8)) qualifiers.add(r.team)

  const groupMatches = matches.filter((m) => m.stage === 'group')
  const groupComplete = groupMatches.length > 0 && groupMatches.every((m) => m.score?.ft)

  // Tournament-wide record, furthest stage reached, and knockout eliminations.
  const rec = new Map() // team -> { mp, w, d, l, gf, ga }
  const stage = new Map() // team -> furthest STAGE_RANK
  const knockedOut = new Set() // lost a completed knockout tie
  const get = (t) => {
    let r = rec.get(t)
    if (!r) rec.set(t, (r = { mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 }))
    return r
  }

  for (const m of matches) {
    const knockout = m.stage !== 'group'
    if (knockout) {
      const sr = STAGE_RANK[m.stage] ?? 0
      for (const t of [m.team1, m.team2]) {
        if (sr > (stage.get(t) ?? -1)) stage.set(t, sr)
      }
    }
    const reg = m.score?.et ?? m.score?.ft
    if (!reg) continue
    const [a, b] = reg
    const t1 = get(m.team1)
    const t2 = get(m.team2)
    t1.mp++; t2.mp++
    t1.gf += a; t1.ga += b
    t2.gf += b; t2.ga += a
    if (a > b) { t1.w++; t2.l++ }
    else if (a < b) { t2.w++; t1.l++ }
    else { t1.d++; t2.d++ }
    if (knockout) {
      // A drawn knockout tie is decided on penalties (score.p); the loser is out.
      let winner = a > b ? m.team1 : a < b ? m.team2 : null
      if (!winner && m.score?.p) winner = m.score.p[0] > m.score.p[1] ? m.team1 : m.team2
      if (winner) knockedOut.add(winner === m.team1 ? m.team2 : m.team1)
    }
  }

  const build = (team) => {
    const r = rec.get(team) ?? { mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 }
    return {
      team,
      ...r,
      gd: r.gf - r.ga,
      pts: r.w * 3 + r.d,
      stage: stage.get(team) ?? 0,
      out: knockedOut.has(team) || !qualifiers.has(team),
    }
  }

  const byRank = (x, y) =>
    y.stage - x.stage ||
    y.pts - x.pts ||
    y.gd - x.gd ||
    y.gf - x.gf ||
    x.team.localeCompare(y.team)

  const all = []
  for (const rows of Object.values(groups)) for (const row of rows) all.push(build(row.team))
  const alive = all.filter((r) => !r.out).sort(byRank)
  const out = all.filter((r) => r.out).sort(byRank)
  return {
    ranked: [...alive, ...out],
    cutoff: alive.length,
    dividerLabel: groupComplete ? 'Eliminated' : 'Round of 32 cutoff',
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

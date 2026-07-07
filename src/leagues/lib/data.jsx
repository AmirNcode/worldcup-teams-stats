import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import snapshot from '../data/snapshot.json'
import { leagueById } from './leagues'
import { fetchLeagueStandings, fetchLeagueMatches, fetchTeamBundle } from './espn'

// Owns the league-soccer data (standings + fixtures window per league) from
// ESPN. Layered like the F1 provider: bundled snapshot = offline floor →
// localStorage cache (last good live payload) → live fetch. Leagues are
// fetched lazily: a league loads the first time a page views it, then
// refreshes on tab focus and a gentle 6h tick — league tables change at most
// a few times a week outside matchdays. Every fetch is fail-soft: a bad or
// blocked response keeps the previous state, so the UI always renders.
const CACHE_KEY = 'leagues.espn.v1'
const IDLE_MS = 6 * 60 * 60 * 1000 // 6h

const LeaguesContext = createContext(null)

const hasWindow = typeof window !== 'undefined'

function loadCache() {
  if (!hasWindow) return null
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Build the starting model: bundled snapshot as the floor, cached live
// payloads on top. A cached entry may predate fields added later (e.g. the
// teams list) — any field it lacks falls back to the bundled entry rather
// than silently vanishing. Pure and exported for tests.
export function initialLeaguesModel(snapshotLeagues, cached) {
  const base = {}
  for (const [id, data] of Object.entries(snapshotLeagues ?? {})) {
    base[id] = { ...data, fetchedAt: null, source: 'bundled' }
  }
  for (const [id, data] of Object.entries(cached ?? {})) {
    base[id] = {
      ...base[id],
      ...data,
      teams: data.teams?.length ? data.teams : (base[id]?.teams ?? []),
      source: 'cache',
    }
  }
  return base
}

export function LeaguesDataProvider({ children }) {
  // { [leagueId]: { standings, matches, teams, fetchedAt, source } }
  const [model, setModel] = useState(() => initialLeaguesModel(snapshot.leagues, loadCache()))
  const inFlight = useRef(new Set())
  // per-club bundles (squad/fixtures/results), in-memory for the session
  const [teamCache, setTeamCache] = useState({})

  const refresh = useCallback(async (leagueId) => {
    const league = leagueById(leagueId)
    if (!league || inFlight.current.has(leagueId)) return
    inFlight.current.add(leagueId)
    try {
      const getJson = (url) => fetch(url).then((r) => r.json())
      const [standings, matches] = await Promise.all([
        fetchLeagueStandings(getJson, league.espn),
        fetchLeagueMatches(getJson, league.espn),
      ])
      if (!standings.rows.length && !matches.length) return // garbled payload — keep prior state
      setModel((prev) => {
        // the teams list is not CORS-fetchable in the browser (see teamsUrl);
        // carry the bundled/cached list forward through live refreshes, and
        // never let an empty carried list shadow the bundled one
        const teams = prev[leagueId]?.teams?.length
          ? prev[leagueId].teams
          : (snapshot.leagues?.[leagueId]?.teams ?? [])
        const entry = { standings, matches, teams, fetchedAt: Date.now(), source: 'live' }
        const next = { ...prev, [leagueId]: entry }
        try {
          const live = Object.fromEntries(
            Object.entries(next).filter(([, v]) => v.source === 'live'),
          )
          window.localStorage.setItem(CACHE_KEY, JSON.stringify(live))
        } catch {
          /* storage full / unavailable — non-fatal */
        }
        return next
      })
    } catch {
      /* network/parse failure — keep snapshot or cache */
    } finally {
      inFlight.current.delete(leagueId)
    }
  }, [])

  const loadedTeams = useRef(new Set())
  const loadTeam = useCallback(async (leagueId, teamId) => {
    const key = `${leagueId}:${teamId}`
    const league = leagueById(leagueId)
    if (!league || !teamId || inFlight.current.has(key) || loadedTeams.current.has(key)) return
    inFlight.current.add(key)
    try {
      const getJson = (url) => fetch(url).then((r) => r.json())
      const bundle = await fetchTeamBundle(getJson, league.espn, teamId)
      loadedTeams.current.add(key)
      setTeamCache((prev) => ({ ...prev, [key]: bundle }))
    } catch {
      /* network/parse failure — page keeps its loading/empty state */
    } finally {
      inFlight.current.delete(key)
    }
  }, [])

  const value = useMemo(
    () => ({ model, refresh, teamCache, loadTeam }),
    [model, refresh, teamCache, loadTeam],
  )
  return <LeaguesContext.Provider value={value}>{children}</LeaguesContext.Provider>
}

// Page hook: returns the league's data and keeps it fresh while viewed
// (initial lazy fetch, refetch on tab focus, 6h tick). Only the league being
// viewed polls — the other four stay quiet.
export function useLeagueData(leagueId) {
  const { model, refresh } = useContext(LeaguesContext)
  useEffect(() => {
    refresh(leagueId)
    const tick = () => {
      if (document.visibilityState === 'visible') refresh(leagueId)
    }
    document.addEventListener('visibilitychange', tick)
    const id = setInterval(tick, IDLE_MS)
    return () => {
      document.removeEventListener('visibilitychange', tick)
      clearInterval(id)
    }
  }, [leagueId, refresh])
  const entry = model[leagueId]
  return {
    standings: entry?.standings ?? { season: null, seasonYear: null, rows: [] },
    matches: entry?.matches ?? [],
    teams: entry?.teams ?? [],
    updatedAt: entry?.fetchedAt ? new Date(entry.fetchedAt) : null,
    source: entry?.source ?? 'bundled',
    refresh: () => refresh(leagueId),
  }
}

// Team-page hook: squad + fixtures + results for one club, fetched lazily the
// first time the page is viewed and kept in memory for the session. Rosters
// and per-team schedules are too bulky to snapshot for ~96 clubs, so this is
// live-only — the page shows a loading state offline (fail-soft, no crash).
export function useLeagueTeam(leagueId, teamId) {
  const { teamCache, loadTeam } = useContext(LeaguesContext)
  useEffect(() => {
    loadTeam(leagueId, teamId)
  }, [leagueId, teamId, loadTeam])
  return teamCache[`${leagueId}:${teamId}`] ?? null
}

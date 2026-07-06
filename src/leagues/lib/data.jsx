import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import snapshot from '../data/snapshot.json'
import { leagueById } from './leagues'
import { fetchLeagueStandings, fetchLeagueMatches } from './espn'

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

export function LeaguesDataProvider({ children }) {
  // { [leagueId]: { standings, matches, fetchedAt, source } }
  const [model, setModel] = useState(() => {
    const cached = loadCache()
    const base = {}
    for (const [id, data] of Object.entries(snapshot.leagues ?? {})) {
      base[id] = { ...data, fetchedAt: null, source: 'bundled' }
    }
    for (const [id, data] of Object.entries(cached ?? {})) {
      base[id] = { ...data, source: 'cache' }
    }
    return base
  })
  const inFlight = useRef(new Set())

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
      const entry = { standings, matches, fetchedAt: Date.now(), source: 'live' }
      setModel((prev) => {
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

  const value = useMemo(() => ({ model, refresh }), [model, refresh])
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
    updatedAt: entry?.fetchedAt ? new Date(entry.fetchedAt) : null,
    source: entry?.source ?? 'bundled',
    refresh: () => refresh(leagueId),
  }
}

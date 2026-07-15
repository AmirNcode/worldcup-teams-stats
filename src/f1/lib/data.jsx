import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import snapshot from '../data/snapshot.json'
import {
  scheduleUrl,
  driverStandingsUrl,
  constructorStandingsUrl,
  parseSchedule,
  parseDriverStandings,
  parseConstructorStandings,
  fetchAllResults,
  normalize,
} from './jolpica'

// Owns the F1 structured data (schedule, standings, results) from Jolpica.
// Layered like the soccer DataProvider: bundled snapshot = offline floor →
// localStorage cache (last good live payload) → live fetch. Every fetch is
// fail-soft: a bad/blocked response keeps the previous state, so the UI always
// renders. Structured F1 data changes at most a few times per race weekend, so
// polling is gentle; OpenF1 live timing (a faster overlay) is a later phase.
const CACHE_KEY = 'f1.jolpica.v1'
const IDLE_MS = 6 * 60 * 60 * 1000 // 6h

const F1Context = createContext(null)
export const useF1Data = () => useContext(F1Context)

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

async function fetchModel() {
  const getJson = (url) => fetch(url).then((r) => r.json())
  const [sch, ds, cs, results] = await Promise.all([
    getJson(scheduleUrl()),
    getJson(driverStandingsUrl()),
    getJson(constructorStandingsUrl()),
    fetchAllResults(getJson),
  ])
  return normalize({
    season: sch?.MRData?.RaceTable?.season ?? null,
    schedule: parseSchedule(sch),
    driverStandings: parseDriverStandings(ds),
    constructorStandings: parseConstructorStandings(cs),
    results,
  })
}

export function F1DataProvider({ children }) {
  const cached = loadCache()
  const [model, setModel] = useState(() => cached?.model ?? snapshot)
  const [updatedAt, setUpdatedAt] = useState(() => (cached?.fetchedAt ? new Date(cached.fetchedAt) : null))
  const [source, setSource] = useState(() => (cached ? 'cache' : 'bundled'))

  const refresh = useCallback(async () => {
    try {
      const next = await fetchModel()
      // ignore an empty/garbled payload — keep the previous good data
      if (!next.rounds.length && !next.drivers.length) return
      setModel(next)
      const now = Date.now()
      setUpdatedAt(new Date(now))
      setSource('live')
      try {
        window.localStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: now, model: next }))
      } catch {
        /* storage full / unavailable — non-fatal */
      }
    } catch {
      /* network/parse failure — keep snapshot or cache */
    }
  }, [])

  useEffect(() => {
    refresh()
    const tick = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', tick)
    const id = setInterval(tick, IDLE_MS)
    return () => {
      document.removeEventListener('visibilitychange', tick)
      clearInterval(id)
    }
  }, [refresh])

  const value = useMemo(() => ({ model, updatedAt, source, refresh }), [model, updatedAt, source, refresh])
  return <F1Context.Provider value={value}>{children}</F1Context.Provider>
}

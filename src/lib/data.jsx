import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import bundled from '../data/schedule.json'

const SOURCE = bundled.source
const CACHE_KEY = 'wc26.liveData.v1'
const REFRESH_MS = 5 * 60 * 1000 // scores only change at HT/FT, 5 min is plenty

// Overlay the live openfootball payload onto the bundled schedule.
// date+ground uniquely identifies a match; index is the fallback in case a
// venue string is ever edited upstream.
function applyLive(base, rawMatches) {
  const byKey = new Map(base.map((m, i) => [m.key, i]))
  const out = base.map((m) => ({ ...m }))
  rawMatches.forEach((rm, i) => {
    const key = `${rm.date}|${rm.ground}`
    let j = byKey.has(key) ? byKey.get(key) : rawMatches.length === out.length ? i : -1
    if (j < 0) return
    const t = out[j]
    if (typeof rm.team1 === 'string') t.team1 = rm.team1
    if (typeof rm.team2 === 'string') t.team2 = rm.team2
    t.score = rm.score ?? null
    t.goals1 = rm.goals1 ?? null
    t.goals2 = rm.goals2 ?? null
  })
  return out
}

function readCache() {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY))
    if (c && Array.isArray(c.matches)) return c
  } catch {
    /* corrupt cache is fine to ignore */
  }
  return null
}

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [state, setState] = useState(() => {
    const cached = readCache()
    return {
      matches: cached ? applyLive(bundled.matches, cached.matches) : bundled.matches,
      updatedAt: cached ? new Date(cached.fetchedAt) : null,
      source: cached ? 'cache' : 'bundled',
    }
  })
  const fetching = useRef(false)

  const refresh = useCallback(async () => {
    if (fetching.current) return
    fetching.current = true
    try {
      const res = await fetch(`${SOURCE}?t=${Date.now()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw = await res.json()
      if (!Array.isArray(raw.matches)) throw new Error('bad payload')
      const fetchedAt = new Date().toISOString()
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt, matches: raw.matches }))
      } catch {
        /* storage full/blocked — live data still applies for this session */
      }
      setState({
        matches: applyLive(bundled.matches, raw.matches),
        updatedAt: new Date(fetchedAt),
        source: 'live',
      })
    } catch {
      setState((s) => (s.source === 'live' ? s : { ...s, source: s.source }))
    } finally {
      fetching.current = false
    }
  }, [])

  useEffect(() => {
    refresh()
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, REFRESH_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refresh])

  const value = useMemo(() => ({ ...state, refresh }), [state, refresh])
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  return useContext(DataContext)
}

export function matchStatus(m, now = new Date()) {
  const s = m.score
  if (s && (s.ft || s.p)) return 'ft'
  if (s && s.ht) return 'ht'
  const ko = new Date(m.kickoff)
  if (now >= ko) {
    // no score yet; matches run ~2h, leave margin for the feed to catch up
    return now - ko < 3 * 60 * 60 * 1000 ? 'live' : 'pending'
  }
  return 'upcoming'
}

export function finalScore(m) {
  const s = m.score
  if (!s) return null
  if (s.et) return s.et
  return s.ft ?? null
}

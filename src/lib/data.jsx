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
import { SCOREBOARD_URL, parseScoreboard, applyEspn } from './espn'

const OPENFOOTBALL_URL = bundled.source
const OF_CACHE_KEY = 'wc26.liveData.v1'
const ESPN_CACHE_KEY = 'wc26.espnData.v1'
const REFRESH_MS = 5 * 60 * 1000 // scores surface at HT and FT; 5 min is plenty

// Overlay the openfootball payload onto the bundled schedule.
// date+ground uniquely identifies a match; index is the fallback in case a
// venue string is ever edited upstream.
function applyOpenfootball(base, rawMatches) {
  const byKey = new Map(base.map((m, i) => [m.key, i]))
  rawMatches.forEach((rm, i) => {
    const key = `${rm.date}|${rm.ground}`
    let j = byKey.has(key) ? byKey.get(key) : rawMatches.length === base.length ? i : -1
    if (j < 0) return
    const t = base[j]
    if (typeof rm.team1 === 'string') t.team1 = rm.team1
    if (typeof rm.team2 === 'string') t.team2 = rm.team2
    if (rm.score) t.score = rm.score
    if (rm.goals1) t.goals1 = rm.goals1
    if (rm.goals2) t.goals2 = rm.goals2
  })
  return base
}

function readCache(key, validate) {
  try {
    const c = JSON.parse(localStorage.getItem(key))
    if (c && validate(c)) return c
  } catch {
    /* corrupt cache is fine to ignore */
  }
  return null
}

function writeCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full/blocked — data still applies for this session */
  }
}

// ESPN last (primary live source) so its fresher state wins over the slower
// openfootball file; openfootball's curated scorer names win where present
// because applyEspn only fills goals into matches that don't have them.
function buildMatches(ofRaw, espnEvents) {
  const out = bundled.matches.map((m) => ({ ...m }))
  if (ofRaw) applyOpenfootball(out, ofRaw)
  if (espnEvents) applyEspn(out, espnEvents)
  return out
}

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [state, setState] = useState(() => {
    const of = readCache(OF_CACHE_KEY, (c) => Array.isArray(c.matches))
    const espn = readCache(ESPN_CACHE_KEY, (c) => Array.isArray(c.events))
    const newest = [of?.fetchedAt, espn?.fetchedAt].filter(Boolean).sort().pop()
    return {
      matches: buildMatches(of?.matches, espn?.events),
      updatedAt: newest ? new Date(newest) : null,
      source: newest ? 'cache' : 'bundled',
    }
  })
  const fetching = useRef(false)

  const refresh = useCallback(async () => {
    if (fetching.current) return
    fetching.current = true
    try {
      const [ofRes, espnRes] = await Promise.allSettled([
        fetch(`${OPENFOOTBALL_URL}?t=${Date.now()}`, { cache: 'no-store' }).then((r) =>
          r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)),
        ),
        fetch(SCOREBOARD_URL, { cache: 'no-store' }).then((r) =>
          r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)),
        ),
      ])
      const fetchedAt = new Date().toISOString()

      let ofRaw = null
      if (ofRes.status === 'fulfilled' && Array.isArray(ofRes.value?.matches)) {
        ofRaw = ofRes.value.matches
        writeCache(OF_CACHE_KEY, { fetchedAt, matches: ofRaw })
      } else {
        ofRaw = readCache(OF_CACHE_KEY, (c) => Array.isArray(c.matches))?.matches ?? null
      }

      let espnEvents = null
      if (espnRes.status === 'fulfilled') {
        const parsed = parseScoreboard(espnRes.value)
        if (parsed.length > 0) {
          espnEvents = parsed
          writeCache(ESPN_CACHE_KEY, { fetchedAt, events: parsed })
        }
      }
      if (!espnEvents) {
        espnEvents = readCache(ESPN_CACHE_KEY, (c) => Array.isArray(c.events))?.events ?? null
      }

      const anyLive = ofRes.status === 'fulfilled' || espnRes.status === 'fulfilled'
      setState((s) => ({
        matches: buildMatches(ofRaw, espnEvents),
        updatedAt: anyLive ? new Date(fetchedAt) : s.updatedAt,
        source: anyLive ? 'live' : s.source,
      }))
    } catch {
      // a malformed payload must never take the page down; keep current state
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

// Status precedence: a recorded result, then ESPN's live state, then the clock.
// Possible values: upcoming | 1h | ht | 2h | et | pens | live | pending | ft
export function matchStatus(m, now = new Date()) {
  const s = m.score
  if (m.liveState && m.liveState !== 'ft') return m.liveState
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

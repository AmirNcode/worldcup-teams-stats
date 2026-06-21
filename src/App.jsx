import { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { useData } from './lib/data.jsx'
import { useTheme } from './lib/prefs'
import { initAnalytics, trackPageview, track } from './lib/analytics'
import { sectionForPath } from './lib/sections'
import { useF1Data } from './f1/lib/data.jsx'
import AdSlot from './components/AdSlot'
import FeedbackForm from './components/FeedbackForm'
import SportSwitcher from './components/SportSwitcher'
import GroupsPage from './pages/GroupsPage'
import SchedulePage from './pages/SchedulePage'
import TeamsPage from './pages/TeamsPage'
import TeamPage from './pages/TeamPage'
import BracketPage from './pages/BracketPage'
import ScorersPage from './pages/ScorersPage'
import ComparePage from './pages/ComparePage'
import F1StatsPage from './f1/pages/F1StatsPage'
import F1CalendarPage from './f1/pages/F1CalendarPage'
import F1TeamsPage from './f1/pages/F1TeamsPage'
import F1TeamPage from './f1/pages/F1TeamPage'
import F1DriversPage from './f1/pages/F1DriversPage'
import F1DriverPage from './f1/pages/F1DriverPage'
import F1CircuitsPage from './f1/pages/F1CircuitsPage'
import F1CircuitPage from './f1/pages/F1CircuitPage'
import F1RacePage from './f1/pages/F1RacePage'

function UpdatedChip() {
  const { updatedAt, source, refresh } = useData()
  const label = updatedAt
    ? `Updated ${updatedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : source === 'bundled'
      ? 'Offline data'
      : 'Loading…'
  return (
    <button className="chip" onClick={refresh} title="Scores refresh at half-time and full-time. Tap to refresh now.">
      ⟳ {label}
    </button>
  )
}

function F1UpdatedChip() {
  const { updatedAt, source, refresh } = useF1Data()
  const label = updatedAt
    ? `Updated ${updatedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : source === 'bundled'
      ? 'Offline data'
      : 'Loading…'
  return (
    <button className="chip" onClick={refresh} title="Live F1 data via Jolpica. Tap to refresh now.">
      ⟳ {label}
    </button>
  )
}

export default function App() {
  const [theme, toggleTheme] = useTheme()
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const location = useLocation()
  const section = sectionForPath(location.pathname)

  useEffect(() => {
    initAnalytics()
  }, [])
  useEffect(() => {
    trackPageview(location.pathname)
  }, [location.pathname])

  return (
    <div className="app" data-section={section.id}>
      <header className="topbar">
        <h1>
          <SportSwitcher active={section} />
        </h1>
        <div className="topbar-actions">
          <div className="topbar-actions-row">
            <button
              className="chip"
              onClick={() => {
                track('feedback_opened')
                setFeedbackOpen(true)
              }}
              aria-label="Send feedback"
              title="Send feedback"
            >
              ✉️
            </button>
            <button
              className="chip"
              onClick={() => {
                track('theme_toggled', { to: theme === 'dark' ? 'light' : 'dark' })
                toggleTheme()
              }}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
          {section.id === 'f1' ? <F1UpdatedChip /> : <UpdatedChip />}
        </div>
      </header>
      {feedbackOpen && <FeedbackForm onClose={() => setFeedbackOpen(false)} />}
      <main className="content">
        <Routes>
          <Route path="/" element={<GroupsPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/team/:slug" element={<TeamPage />} />
          <Route path="/bracket" element={<BracketPage />} />
          <Route path="/scorers" element={<ScorersPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/f1" element={<F1CalendarPage />} />
          <Route path="/f1/standings" element={<Navigate to="/f1/drivers" replace />} />
          <Route path="/f1/teams" element={<F1TeamsPage />} />
          <Route path="/f1/team/:slug" element={<F1TeamPage />} />
          <Route path="/f1/drivers" element={<F1DriversPage />} />
          <Route path="/f1/driver/:slug" element={<F1DriverPage />} />
          <Route path="/f1/circuits" element={<F1CircuitsPage />} />
          <Route path="/f1/circuit/:slug" element={<F1CircuitPage />} />
          <Route path="/f1/race/:round" element={<F1RacePage />} />
          <Route path="/f1/stats" element={<F1StatsPage />} />
          <Route path="*" element={<GroupsPage />} />
        </Routes>
        {/* keyed by route so a genuine in-app navigation requests a fresh ad */}
        <AdSlot key={location.pathname} />
      </main>
      <nav className="tabbar">
        {section.tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end}>
            <span>{t.emoji}</span>
            {t.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

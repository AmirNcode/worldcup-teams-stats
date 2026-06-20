import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SECTIONS } from '../lib/sections'

// The top-bar title, as a dropdown that switches between sports. Replaces the
// old "title links to home" behavior: tapping the title opens the menu, and
// picking a sport navigates to that section's home route.
export default function SportSwitcher({ active }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const choose = (s) => {
    setOpen(false)
    if (s.id !== active.id) navigate(s.home)
  }

  return (
    <div className="sport-switcher" ref={ref}>
      <button
        type="button"
        className="sport-title"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Switch sport"
      >
        <span aria-hidden="true">{active.emoji}</span> {active.title}
        <span className="sport-caret" aria-hidden="true">
          {open ? '▴' : '▾'}
        </span>
      </button>
      {open && (
        <ul className="sport-menu" role="menu">
          {SECTIONS.map((s) => (
            <li key={s.id} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={s.id === active.id}
                className={`sport-option${s.id === active.id ? ' on' : ''}`}
                onClick={() => choose(s)}
              >
                <span className="sport-option-main">
                  <span aria-hidden="true">{s.emoji}</span> {s.title}
                </span>
                <span className="sport-option-sub">{s.sport}</span>
                {s.id === active.id && (
                  <span className="sport-check" aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

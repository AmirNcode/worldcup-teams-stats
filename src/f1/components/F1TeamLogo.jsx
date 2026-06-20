import { useState } from 'react'

// A constructor's logo. Tries public/f1/logos/<constructorId>.svg first; if that
// file is absent (or fails to load) it falls back to a color badge showing the
// team's abbreviation. Drop SVG (or PNG, adjust the extension) files into
// public/f1/logos/ to light up real logos — see the README there.
export default function F1TeamLogo({ team, className = '' }) {
  const [failed, setFailed] = useState(false)
  if (!team) return null

  if (failed) {
    return (
      <span
        className={`f1-logo f1-logo-badge ${className}`.trim()}
        style={{ background: team.color }}
        aria-hidden="true"
      >
        {team.abbr}
      </span>
    )
  }

  return (
    <img
      className={`f1-logo ${className}`.trim()}
      src={`f1/logos/${team.constructorId}.svg`}
      alt={`${team.name} logo`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

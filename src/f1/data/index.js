// Lookups and derivations over the F1 mock data. Swapping in a real feed later
// means re-pointing these helpers; the pages depend only on this module.
import { teams } from './teams'
import { drivers } from './drivers'
import { circuits } from './circuits'
import { calendar } from './calendar'

export { teams, drivers, circuits, calendar }

export const driverBySlug = (slug) => drivers.find((d) => d.slug === slug)
export const teamBySlug = (slug) => teams.find((t) => t.slug === slug)
export const circuitBySlug = (slug) => circuits.find((c) => c.slug === slug)

export const driversByPoints = () => [...drivers].sort((a, b) => b.points - a.points)
export const teamsByPoints = () => [...teams].sort((a, b) => b.points - a.points)
export const teamDrivers = (teamSlug) =>
  drivers.filter((d) => d.team === teamSlug).sort((a, b) => b.points - a.points)

export const doneRounds = () => calendar.filter((r) => Array.isArray(r.result))
export const nextRound = () =>
  calendar.find((r) => r.status === 'next') ?? calendar.find((r) => r.status !== 'done')

// A driver's finishes across completed rounds, most recent first. pos is the
// finishing position (1-based) or null if the driver was outside the top 10.
export const driverResults = (slug) =>
  doneRounds()
    .reverse()
    .map((r) => {
      const i = r.result.indexOf(slug)
      return { round: r.round, name: r.name, circuitSlug: r.circuitSlug, date: r.date, pos: i >= 0 ? i + 1 : null }
    })

// The most recent completed race held at a circuit (for its weekend fastest lap).
export const doneRoundAtCircuit = (circuitSlug) =>
  doneRounds()
    .reverse()
    .find((r) => r.circuitSlug === circuitSlug)

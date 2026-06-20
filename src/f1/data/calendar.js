// SAMPLE / MOCK DATA — placeholder race calendar for the Formula 1 section.
// Not authoritative. Replaced later by a real feed (Jolpica). See PLAN.md §3-4.
// A round is "done" when it has a `result` (finishing order, top 10, by driver
// slug). result[0] is the winner; result.slice(0,3) is the podium. `pole` and
// `fastestLap` are driver slugs. `start` is the race start as an ISO timestamp
// carrying the circuit's local UTC offset, so it renders in the visitor's own
// time zone (same approach as the soccer kickoffs).
export const calendar = [
  { round: 1, name: 'Australian Grand Prix', circuitSlug: 'albert-park', date: '2026-03-08', start: '2026-03-08T15:00:00+11:00', status: 'done',
    result: ['norris', 'verstappen', 'russell', 'piastri', 'leclerc', 'hamilton', 'antonelli', 'albon', 'hulkenberg', 'sainz'], pole: 'norris', fastestLap: 'verstappen' },
  { round: 2, name: 'Chinese Grand Prix', circuitSlug: 'shanghai', date: '2026-03-22', start: '2026-03-22T15:00:00+08:00', status: 'done',
    result: ['piastri', 'norris', 'russell', 'leclerc', 'hamilton', 'verstappen', 'antonelli', 'ocon', 'albon', 'bearman'], pole: 'piastri', fastestLap: 'norris' },
  { round: 3, name: 'Japanese Grand Prix', circuitSlug: 'suzuka', date: '2026-04-12', start: '2026-04-12T14:00:00+09:00', status: 'done',
    result: ['verstappen', 'norris', 'piastri', 'leclerc', 'russell', 'antonelli', 'hamilton', 'hadjar', 'albon', 'sainz'], pole: 'verstappen', fastestLap: 'piastri' },
  { round: 4, name: 'Bahrain Grand Prix', circuitSlug: 'bahrain', date: '2026-04-26', start: '2026-04-26T18:00:00+03:00', status: 'done',
    result: ['piastri', 'russell', 'norris', 'leclerc', 'hamilton', 'verstappen', 'gasly', 'sainz', 'antonelli', 'hulkenberg'], pole: 'piastri', fastestLap: 'hamilton' },
  { round: 5, name: 'Saudi Arabian Grand Prix', circuitSlug: 'jeddah', date: '2026-05-10', start: '2026-05-10T20:00:00+03:00', status: 'done',
    result: ['piastri', 'verstappen', 'leclerc', 'norris', 'russell', 'hamilton', 'antonelli', 'sainz', 'hadjar', 'albon'], pole: 'leclerc', fastestLap: 'russell' },
  { round: 6, name: 'Miami Grand Prix', circuitSlug: 'miami', date: '2026-05-24', start: '2026-05-24T16:00:00-04:00', status: 'done',
    result: ['norris', 'piastri', 'russell', 'verstappen', 'hamilton', 'leclerc', 'alonso', 'hulkenberg', 'ocon', 'stroll'], pole: 'norris', fastestLap: 'leclerc' },
  { round: 7, name: 'Emilia-Romagna Grand Prix', circuitSlug: 'imola', date: '2026-06-28', start: '2026-06-28T15:00:00+02:00', status: 'next' },
  { round: 8, name: 'Monaco Grand Prix', circuitSlug: 'monaco', date: '2026-07-05', start: '2026-07-05T15:00:00+02:00', status: 'upcoming' },
  { round: 9, name: 'Spanish Grand Prix', circuitSlug: 'catalunya', date: '2026-07-19', start: '2026-07-19T15:00:00+02:00', status: 'upcoming' },
  { round: 10, name: 'Canadian Grand Prix', circuitSlug: 'gilles-villeneuve', date: '2026-08-02', start: '2026-08-02T14:00:00-04:00', status: 'upcoming' },
  { round: 11, name: 'Austrian Grand Prix', circuitSlug: 'red-bull-ring', date: '2026-08-30', start: '2026-08-30T15:00:00+02:00', status: 'upcoming' },
  { round: 12, name: 'British Grand Prix', circuitSlug: 'silverstone', date: '2026-09-06', start: '2026-09-06T15:00:00+01:00', status: 'upcoming' },
]

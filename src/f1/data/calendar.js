// SAMPLE / MOCK DATA — placeholder race calendar for the Formula 1 section.
// Not authoritative. Replaced later by a real feed (Jolpica). See PLAN.md §3-4.
// A round is "done" when it has a `result` (finishing order, top 10, by driver
// slug). result[0] is the winner; result.slice(0,3) is the podium. `pole` and
// `fastestLap` are driver slugs. Upcoming rounds carry only a date + status.
export const calendar = [
  { round: 1, name: 'Australian Grand Prix', circuitSlug: 'albert-park', date: '2026-03-08', status: 'done',
    result: ['norris', 'verstappen', 'russell', 'piastri', 'leclerc', 'hamilton', 'antonelli', 'albon', 'hulkenberg', 'sainz'], pole: 'norris', fastestLap: 'verstappen' },
  { round: 2, name: 'Chinese Grand Prix', circuitSlug: 'shanghai', date: '2026-03-22', status: 'done',
    result: ['piastri', 'norris', 'russell', 'leclerc', 'hamilton', 'verstappen', 'antonelli', 'ocon', 'albon', 'bearman'], pole: 'piastri', fastestLap: 'norris' },
  { round: 3, name: 'Japanese Grand Prix', circuitSlug: 'suzuka', date: '2026-04-12', status: 'done',
    result: ['verstappen', 'norris', 'piastri', 'leclerc', 'russell', 'antonelli', 'hamilton', 'hadjar', 'albon', 'sainz'], pole: 'verstappen', fastestLap: 'piastri' },
  { round: 4, name: 'Bahrain Grand Prix', circuitSlug: 'bahrain', date: '2026-04-26', status: 'done',
    result: ['piastri', 'russell', 'norris', 'leclerc', 'hamilton', 'verstappen', 'gasly', 'sainz', 'antonelli', 'hulkenberg'], pole: 'piastri', fastestLap: 'hamilton' },
  { round: 5, name: 'Saudi Arabian Grand Prix', circuitSlug: 'jeddah', date: '2026-05-10', status: 'done',
    result: ['piastri', 'verstappen', 'leclerc', 'norris', 'russell', 'hamilton', 'antonelli', 'sainz', 'hadjar', 'albon'], pole: 'leclerc', fastestLap: 'russell' },
  { round: 6, name: 'Miami Grand Prix', circuitSlug: 'miami', date: '2026-05-24', status: 'done',
    result: ['norris', 'piastri', 'russell', 'verstappen', 'hamilton', 'leclerc', 'alonso', 'hulkenberg', 'ocon', 'stroll'], pole: 'norris', fastestLap: 'leclerc' },
  { round: 7, name: 'Emilia-Romagna Grand Prix', circuitSlug: 'imola', date: '2026-06-28', status: 'next' },
  { round: 8, name: 'Monaco Grand Prix', circuitSlug: 'monaco', date: '2026-07-05', status: 'upcoming' },
  { round: 9, name: 'Spanish Grand Prix', circuitSlug: 'catalunya', date: '2026-07-19', status: 'upcoming' },
  { round: 10, name: 'Canadian Grand Prix', circuitSlug: 'gilles-villeneuve', date: '2026-08-02', status: 'upcoming' },
  { round: 11, name: 'Austrian Grand Prix', circuitSlug: 'red-bull-ring', date: '2026-08-30', status: 'upcoming' },
  { round: 12, name: 'British Grand Prix', circuitSlug: 'silverstone', date: '2026-09-06', status: 'upcoming' },
]

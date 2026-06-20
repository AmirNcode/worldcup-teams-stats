// SAMPLE / MOCK DATA — placeholder drivers for the Formula 1 section.
// Not authoritative. Replaced later by a real feed (Jolpica). See PLAN.md §3-4.
// Season aggregates (points/wins/podiums/poles) are hand-set to stay consistent
// with the six "done" rounds in calendar.js: total wins = 6, total podium slots
// = 18, total poles = 6. `team` is a constructor slug from teams.js.
export const drivers = [
  { slug: 'piastri', name: 'Oscar Piastri', code: 'PIA', number: 81, country: 'Australia', flag: '🇦🇺', team: 'mclaren', points: 156, wins: 3, podiums: 5, poles: 2 },
  { slug: 'norris', name: 'Lando Norris', code: 'NOR', number: 4, country: 'United Kingdom', flag: '🇬🇧', team: 'mclaren', points: 145, wins: 2, podiums: 5, poles: 2 },
  { slug: 'verstappen', name: 'Max Verstappen', code: 'VER', number: 1, country: 'Netherlands', flag: '🇳🇱', team: 'redbull', points: 110, wins: 1, podiums: 3, poles: 1 },
  { slug: 'russell', name: 'George Russell', code: 'RUS', number: 63, country: 'United Kingdom', flag: '🇬🇧', team: 'mercedes', points: 99, wins: 0, podiums: 4, poles: 0 },
  { slug: 'leclerc', name: 'Charles Leclerc', code: 'LEC', number: 16, country: 'Monaco', flag: '🇲🇨', team: 'ferrari', points: 79, wins: 0, podiums: 1, poles: 1 },
  { slug: 'hamilton', name: 'Lewis Hamilton', code: 'HAM', number: 44, country: 'United Kingdom', flag: '🇬🇧', team: 'ferrari', points: 63, wins: 0, podiums: 0, poles: 0 },
  { slug: 'antonelli', name: 'Kimi Antonelli', code: 'ANT', number: 12, country: 'Italy', flag: '🇮🇹', team: 'mercedes', points: 48, wins: 0, podiums: 0, poles: 0 },
  { slug: 'albon', name: 'Alex Albon', code: 'ALB', number: 23, country: 'Thailand', flag: '🇹🇭', team: 'williams', points: 34, wins: 0, podiums: 0, poles: 0 },
  { slug: 'hulkenberg', name: 'Nico Hülkenberg', code: 'HUL', number: 27, country: 'Germany', flag: '🇩🇪', team: 'sauber', points: 26, wins: 0, podiums: 0, poles: 0 },
  { slug: 'sainz', name: 'Carlos Sainz', code: 'SAI', number: 55, country: 'Spain', flag: '🇪🇸', team: 'williams', points: 24, wins: 0, podiums: 0, poles: 0 },
  { slug: 'alonso', name: 'Fernando Alonso', code: 'ALO', number: 14, country: 'Spain', flag: '🇪🇸', team: 'aston', points: 18, wins: 0, podiums: 0, poles: 0 },
  { slug: 'ocon', name: 'Esteban Ocon', code: 'OCO', number: 31, country: 'France', flag: '🇫🇷', team: 'haas', points: 17, wins: 0, podiums: 0, poles: 0 },
  { slug: 'stroll', name: 'Lance Stroll', code: 'STR', number: 18, country: 'Canada', flag: '🇨🇦', team: 'aston', points: 14, wins: 0, podiums: 0, poles: 0 },
  { slug: 'gasly', name: 'Pierre Gasly', code: 'GAS', number: 10, country: 'France', flag: '🇫🇷', team: 'alpine', points: 12, wins: 0, podiums: 0, poles: 0 },
  { slug: 'hadjar', name: 'Isack Hadjar', code: 'HAD', number: 6, country: 'France', flag: '🇫🇷', team: 'racingbulls', points: 11, wins: 0, podiums: 0, poles: 0 },
  { slug: 'tsunoda', name: 'Yuki Tsunoda', code: 'TSU', number: 22, country: 'Japan', flag: '🇯🇵', team: 'redbull', points: 10, wins: 0, podiums: 0, poles: 0 },
  { slug: 'bearman', name: 'Oliver Bearman', code: 'BEA', number: 87, country: 'United Kingdom', flag: '🇬🇧', team: 'haas', points: 8, wins: 0, podiums: 0, poles: 0 },
  { slug: 'bortoleto', name: 'Gabriel Bortoleto', code: 'BOR', number: 5, country: 'Brazil', flag: '🇧🇷', team: 'sauber', points: 5, wins: 0, podiums: 0, poles: 0 },
  { slug: 'lawson', name: 'Liam Lawson', code: 'LAW', number: 30, country: 'New Zealand', flag: '🇳🇿', team: 'racingbulls', points: 4, wins: 0, podiums: 0, poles: 0 },
  { slug: 'colapinto', name: 'Franco Colapinto', code: 'COL', number: 43, country: 'Argentina', flag: '🇦🇷', team: 'alpine', points: 2, wins: 0, podiums: 0, poles: 0 },
]

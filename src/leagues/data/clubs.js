// Curated club reference the ESPN feed does not carry: major honours and fun
// facts. Hand-maintained (like the World Cup teams.json) — counts are through
// the 2025-26 season and may drift; this file is the single place to correct
// them. Keyed by ESPN team id. Clubs without an entry simply render no
// honours/facts card (graceful degradation, same policy as F1 curated data).
export const CLUB_INFO = {
  // ---- Premier League ----
  359: {
    honours: ['14× English champions (most recently 2025-26)', '14× FA Cup winners (record)'],
    facts: [
      'Went the entire 2003-04 league season unbeaten — the "Invincibles".',
      'Moved from Highbury to the Emirates Stadium in 2006.',
    ],
  },
  360: {
    honours: ['20× English champions', '3× European Cup / Champions League winners'],
    facts: [
      'The "Busby Babes" rebuilt after the 1958 Munich air disaster to win the European Cup a decade later.',
      'Old Trafford is nicknamed "The Theatre of Dreams".',
    ],
  },
  364: {
    honours: ['20× English champions', '6× European Cup / Champions League winners (English record)'],
    facts: [
      'Anfield\'s "You\'ll Never Walk Alone" is football\'s most famous anthem.',
      'Won the 2005 Champions League final after being 3-0 down at half-time.',
    ],
  },
  382: {
    honours: ['10× English champions', '2023 treble winners (league, FA Cup, Champions League)'],
    facts: ['Won four consecutive Premier League titles from 2021 to 2024 — a first in English football.'],
  },
  363: {
    honours: ['6× English champions', '2× Champions League winners'],
    facts: ['Won the 2025 Club World Cup, beating PSG in the final.'],
  },
  367: {
    honours: ['2× English champions', '2025 Europa League winners'],
    facts: ['The 2025 Europa League ended a 17-year wait for a major trophy.', 'Their 62,850-seat stadium opened in 2019 on the White Hart Lane site.'],
  },
  361: { honours: ['4× English champions'], facts: ['St James\' Park has hosted top-flight football since 1893.'] },
  368: { honours: ['9× English champions'], facts: ['Moved into the new Hill Dickinson Stadium at Bramley-Moore Dock in 2025.'] },

  // ---- La Liga ----
  83: {
    honours: ['29× Spanish champions (most recently 2025-26)', '5× Champions League winners'],
    facts: [
      'La Masia academy produced Messi, Xavi and Iniesta — the core of the 2009 sextuple side.',
      '"Més que un club" — more than a club.',
    ],
  },
  86: {
    honours: ['36× Spanish champions (record)', '15× European Cup / Champions League winners (record)'],
    facts: ['Won the first five European Cups ever played (1956-1960).'],
  },
  1068: {
    honours: ['11× Spanish champions'],
    facts: ['Reached two Champions League finals in three seasons (2014, 2016), both against Real Madrid.'],
  },
  93: {
    honours: ['8× Spanish champions'],
    facts: ['One of only three clubs never relegated from La Liga, alongside Real Madrid and Barcelona.', 'Fields only players with Basque roots.'],
  },
  243: { honours: ['1× Spanish champions', '7× Europa League winners (record)'], facts: [] },
  94: { honours: ['6× Spanish champions'], facts: [] },

  // ---- Serie A ----
  110: {
    honours: ['21× Italian champions (most recently 2025-26)', '3× European Cup / Champions League winners'],
    facts: ['The only Italian club never relegated from Serie A.', 'Won the treble in 2010 under José Mourinho.'],
  },
  111: {
    honours: ['36× Italian champions (record)', '2× Champions League winners'],
    facts: ['Won nine consecutive Scudetti from 2012 to 2020 — an Italian record.'],
  },
  103: {
    honours: ['19× Italian champions', '7× European Cup / Champions League winners'],
    facts: ['San Siro, shared with Inter, is Italy\'s largest stadium.'],
  },
  114: {
    honours: ['4× Italian champions (most recently 2024-25)'],
    facts: ['Diego Maradona delivered the club\'s first two Scudetti; the stadium now bears his name.'],
  },
  104: { honours: ['3× Italian champions'], facts: [] },
  112: { honours: ['2× Italian champions'], facts: [] },
  105: { honours: ['2024 Europa League winners'], facts: ['Long renowned for Italy\'s best youth academy.'] },

  // ---- Bundesliga ----
  132: {
    honours: ['35× German champions (record, most recently 2025-26)', '6× European Cup / Champions League winners'],
    facts: ['Won 11 consecutive Bundesliga titles from 2013 to 2023 — a European top-flight record.'],
  },
  124: {
    honours: ['8× German champions', '1997 Champions League winners'],
    facts: ['The "Yellow Wall" at Signal Iduna Park is Europe\'s largest standing terrace (~25,000 fans).'],
  },
  131: {
    honours: ['1× German champions (2023-24, unbeaten)'],
    facts: ['Went the entire 2023-24 Bundesliga season unbeaten under Xabi Alonso.'],
  },
  268: { honours: ['5× German champions'], facts: [] },
  127: { honours: ['6× German champions', '1983 European Cup winners'], facts: ['Back in the Bundesliga after seven second-division seasons (promoted 2025).'] },
  134: { honours: ['5× German champions'], facts: [] },

  // ---- Ligue 1 ----
  160: {
    honours: ['14× French champions (record, most recently 2025-26)', '2025 Champions League winners'],
    facts: ['Completed the first Champions League win in club history in 2025 with a 5-0 final win over Inter.'],
  },
  176: {
    honours: ['9× French champions', '1993 Champions League winners'],
    facts: ['Still the only French club to win the Champions League in the modern era before PSG in 2025.'],
  },
  174: { honours: ['8× French champions'], facts: ['Kylian Mbappé broke through here as a teenager in the 2017 title side.'] },
  167: { honours: ['7× French champions'], facts: ['Won seven consecutive French titles from 2002 to 2008 — a Ligue 1 record.'] },
  166: { honours: ['4× French champions'], facts: [] },
  165: { honours: ['8× French champions'], facts: [] },
}

export const clubInfo = (teamId) => CLUB_INFO[teamId] ?? null

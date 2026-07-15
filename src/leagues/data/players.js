// Curated fun facts for notable players on the Boot tab, keyed by ESPN
// athlete id. Hand-maintained like clubs.js (accurate through 2025, may
// drift; this file is the single place to correct). Players without an entry
// simply show no facts section — the sheet still renders the live bio.
export const PLAYER_FACTS = {
  // ---- Premier League ----
  253989: [
    // Erling Haaland
    'Scored 36 Premier League goals in his debut 2022-23 season — the competition record.',
    'His father Alfie Haaland also played in the Premier League, for Leeds and Manchester City.',
  ],
  198825: [
    // Ollie Watkins
    'Scored the 90th-minute winner against the Netherlands that sent England to the Euro 2024 final.',
    'Rose from League Two Exeter City to England international.',
  ],
  124091: [
    // Bruno Fernandes
    'Manchester United captain, signed from Sporting CP in January 2020.',
    'Among the Premier League leaders in chances created every season since arriving.',
  ],
  298008: [
    // Rayan Cherki
    'Became Lyon\'s youngest ever first-team player at 16 years and 102 days.',
  ],
  201089: [
    // Jarrod Bowen
    'Scored the extra-time winner that gave West Ham the 2023 Conference League — their first major trophy since 1980.',
  ],
  273292: [
    // Antoine Semenyo
    'Ghana international who came through Bristol City\'s academy.',
  ],

  // ---- La Liga ----
  231388: [
    // Kylian Mbappé
    'World Cup winner at 19 in 2018; scored a hat-trick in the 2022 final and still finished on the losing side.',
    'Joined Real Madrid on a free transfer in 2024 after seven seasons and a record goal haul at PSG.',
  ],
  252107: [
    // Vinícius Júnior
    'Scored in the 2022 and 2024 Champions League finals, winning both with Real Madrid.',
  ],
  362150: [
    // Lamine Yamal
    'Youngest goalscorer in European Championship history — at Euro 2024, aged 16.',
    'Made his Barcelona debut at 15 years and 290 days.',
  ],
  265869: [
    // Ferran Torres
    'Nicknamed "El Tiburón" (the shark) for his goal celebrations.',
  ],
  310452: [
    // Arda Güler
    'Turkish playmaker Real Madrid signed at 18 from Fenerbahçe, dubbed the "Turkish Messi".',
  ],
  240209: [
    // Vedat Muriqi
    'Kosovo\'s captain and record scorer.',
  ],

  // ---- Serie A ----
  219713: [
    // Lautaro Martínez
    'Inter captain; won the 2022 World Cup with Argentina and the 2024 Copa América as its top scorer.',
  ],
  217331: [
    // Marcus Thuram
    'Son of France legend Lilian Thuram; the pair are one of few father-son duos with World Cup final appearances.',
  ],
  337970: [
    // Nico Paz
    'Argentine playmaker developed at Real Madrid; Como made him the face of their project.',
  ],
  194748: [
    // Federico Dimarco
    'Boyhood Inter fan from Milan who became the first-choice wing-back and a set-piece specialist.',
  ],
  259481: [
    // Donyell Malen
    'Dutch forward who came through both Ajax\'s and Arsenal\'s academies.',
  ],

  // ---- Bundesliga ----
  142200: [
    // Harry Kane
    'England\'s all-time record goalscorer.',
    'His first career trophy came in 2025 — the Bundesliga title with Bayern, after more than a decade at Tottenham.',
  ],
  186381: [
    // Serhou Guirassy
    'Scored 28 Bundesliga goals for Stuttgart in 2023-24, then starred in Dortmund\'s Champions League runs.',
  ],
  257390: [
    // Luis Díaz
    'Colombian winger who moved from Liverpool to Bayern in 2025.',
    'Grew up in La Guajira and starred at the Indigenous Games before turning pro.',
  ],
  212330: [
    // Patrik Schick
    'His 50-yard halfway-line goal at Euro 2020 won Goal of the Tournament.',
  ],
  286831: [
    // Michael Olise
    'France international who chose Les Bleus after being eligible for four national teams.',
  ],
  273300: [
    // Deniz Undav
    'Went from Germany\'s fifth tier to Bundesliga top scorer contention — a late-bloomer fairy tale.',
  ],

  // ---- Ligue 1 ----
  323850: [
    // Esteban Lepaul
    'Breakout French striker who climbed from the amateur divisions to Ligue 1 top-scorer contention.',
  ],
  276221: [
    // Mason Greenwood
    'Marseille forward; Ligue 1\'s joint top scorer in 2024-25 in his first French season.',
  ],
  282643: [
    // Folarin Balogun
    'Born in New York, raised in London, came through Arsenal\'s academy — chose to play for the USA.',
  ],
  192015: [
    // Ludovic Ajorque
    'Towering Réunion-born target man, one of Ligue 1\'s best aerial threats.',
  ],
}

export const playerFacts = (athleteId) => PLAYER_FACTS[athleteId] ?? null

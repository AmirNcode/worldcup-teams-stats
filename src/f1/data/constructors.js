// Curated constructor reference, keyed by Jolpica/Ergast constructorId. Supplies
// the things the standings feed does NOT carry: team color, badge abbreviation,
// base, power unit, title count, and a couple of facts. Names and points come
// live from Jolpica; this only fills the gaps. Missing teams degrade gracefully
// (the UI tolerates absent fields) — add an entry when a new team appears.
export const constructorInfo = {
  mercedes: { abbr: 'MER', color: '#27F4D2', base: 'Brackley, United Kingdom', powerUnit: 'Mercedes', championships: 8,
    facts: ['Won eight straight Constructors’ titles in the hybrid era.', 'Power-unit supplier to several other teams.'] },
  ferrari: { abbr: 'FER', color: '#E8002D', base: 'Maranello, Italy', powerUnit: 'Ferrari', championships: 16,
    facts: ['The only team to have raced in every season since 1950.', 'Holds the record for the most Constructors’ Championships.'] },
  mclaren: { abbr: 'MCL', color: '#FF8000', base: 'Woking, United Kingdom', powerUnit: 'Mercedes', championships: 9,
    facts: ['Second-oldest team on the current grid, racing since 1966.', 'One of only two teams to win the “triple crown” of motorsport.'] },
  red_bull: { abbr: 'RBR', color: '#3671C6', base: 'Milton Keynes, United Kingdom', powerUnit: 'Red Bull Ford', championships: 6,
    facts: ['Runs its own power-unit project (with Ford) from 2026.', 'Won four straight drivers’ titles in the ground-effect era.'] },
  alpine: { abbr: 'ALP', color: '#0093CC', base: 'Enstone, United Kingdom', powerUnit: 'Mercedes', championships: 0,
    facts: ['Renault’s works team, racing as Alpine since 2021.', 'The Enstone factory has competed under five different names.'] },
  rb: { abbr: 'RB', color: '#6692FF', base: 'Faenza, Italy', powerUnit: 'Red Bull Ford', championships: 0,
    facts: ['Red Bull’s sister team and junior-driver proving ground.', 'Based in Faenza, in Italy’s “Motor Valley”.'] },
  haas: { abbr: 'HAA', color: '#B6BABD', base: 'Kannapolis, United States', powerUnit: 'Ferrari', championships: 0,
    facts: ['The grid’s only American-owned team.', 'Runs a lean model built around customer Ferrari parts.'] },
  williams: { abbr: 'WIL', color: '#64C4FF', base: 'Grove, United Kingdom', powerUnit: 'Mercedes', championships: 9,
    facts: ['Nine Constructors’ titles, all in the 1980s and 1990s.', 'One of the sport’s great independent names.'] },
  audi: { abbr: 'AUD', color: '#009597', base: 'Hinwil, Switzerland', powerUnit: 'Audi', championships: 0,
    facts: ['The works Audi team, evolved from the Sauber outfit.', 'Builds its own power unit at a new facility in Germany.'] },
  aston_martin: { abbr: 'AMR', color: '#229971', base: 'Silverstone, United Kingdom', powerUnit: 'Honda', championships: 0,
    facts: ['Became a Honda works team for the 2026 rules reset.', 'Built a brand-new factory and wind tunnel at Silverstone.'] },
  cadillac: { abbr: 'CAD', color: '#000000', base: 'Indianapolis, United States', powerUnit: 'Ferrari', championships: 0,
    facts: ['The grid’s eleventh team, new for 2026.', 'Backed by General Motors’ Cadillac brand.'] },
}

// 3-letter fallback when a team has no curated abbreviation yet.
export function fallbackAbbr(name = '') {
  return name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'F1'
}

// Maps Jolpica/Ergast driver nationalities (demonyms) to flag emoji. Jolpica
// gives a word like "British"; the UI shows a flag. Unknown values fall back to
// a checkered flag so the UI never breaks.
const FLAGS = {
  British: '🇬🇧',
  German: '🇩🇪',
  Dutch: '🇳🇱',
  Spanish: '🇪🇸',
  French: '🇫🇷',
  Italian: '🇮🇹',
  Monegasque: '🇲🇨',
  Australian: '🇦🇺',
  Finnish: '🇫🇮',
  Mexican: '🇲🇽',
  Canadian: '🇨🇦',
  Thai: '🇹🇭',
  Japanese: '🇯🇵',
  Brazilian: '🇧🇷',
  Argentine: '🇦🇷',
  'New Zealander': '🇳🇿',
  American: '🇺🇸',
  Danish: '🇩🇰',
  Chinese: '🇨🇳',
  Austrian: '🇦🇹',
  Belgian: '🇧🇪',
  Swiss: '🇨🇭',
  Swedish: '🇸🇪',
  Polish: '🇵🇱',
  Russian: '🇷🇺',
  Indonesian: '🇮🇩',
}

export function flagFor(nationality) {
  return FLAGS[nationality] ?? '🏁'
}

// Maps Jolpica race countries (Location.country) to flag emoji, for circuits.
const COUNTRY_FLAGS = {
  Australia: '🇦🇺',
  China: '🇨🇳',
  Japan: '🇯🇵',
  Bahrain: '🇧🇭',
  'Saudi Arabia': '🇸🇦',
  USA: '🇺🇸',
  'United States': '🇺🇸',
  Canada: '🇨🇦',
  Monaco: '🇲🇨',
  Spain: '🇪🇸',
  Austria: '🇦🇹',
  UK: '🇬🇧',
  'United Kingdom': '🇬🇧',
  Belgium: '🇧🇪',
  Hungary: '🇭🇺',
  Netherlands: '🇳🇱',
  Italy: '🇮🇹',
  Azerbaijan: '🇦🇿',
  Singapore: '🇸🇬',
  Mexico: '🇲🇽',
  Brazil: '🇧🇷',
  Qatar: '🇶🇦',
  UAE: '🇦🇪',
  'United Arab Emirates': '🇦🇪',
}

export function countryFlag(country) {
  return COUNTRY_FLAGS[country] ?? '🏁'
}

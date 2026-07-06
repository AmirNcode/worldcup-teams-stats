// Curated circuit reference, keyed by Jolpica/Ergast circuitId. Supplies the
// track facts the schedule feed does NOT carry: lap length, lap count, the lap
// record, and a couple of notes. Circuit name, locality and country come live
// from Jolpica. Circuits without an entry here still list and open fine — their
// extra fields simply show as “—”.
export const circuitInfo = {
  albert_park: { lengthKm: 5.278, laps: 58, lapRecord: { time: '1:19.813', driver: 'Charles Leclerc', year: 2024 }, facts: ['A semi-street circuit around a lakeside park.'] },
  shanghai: { lengthKm: 5.451, laps: 56, lapRecord: { time: '1:32.238', driver: 'Michael Schumacher', year: 2004 }, facts: ['Turns 1-2 form a long, tightening spiral.'] },
  suzuka: { lengthKm: 5.807, laps: 53, lapRecord: { time: '1:30.983', driver: 'Lewis Hamilton', year: 2019 }, facts: ['The only figure-of-eight layout on the calendar.'] },
  miami: { lengthKm: 5.412, laps: 57, lapRecord: { time: '1:29.708', driver: 'Max Verstappen', year: 2023 }, facts: ['Laid out around the Hard Rock Stadium.'] },
  villeneuve: { lengthKm: 4.361, laps: 70, lapRecord: { time: '1:13.078', driver: 'Valtteri Bottas', year: 2019 }, facts: ['Built on an island in the St. Lawrence River.', 'Home of the “Wall of Champions”.'] },
  monaco: { lengthKm: 3.337, laps: 78, lapRecord: { time: '1:12.909', driver: 'Lewis Hamilton', year: 2021 }, facts: ['The slowest and most prestigious race of the year.', 'Includes the calendar’s only tunnel section.'] },
  catalunya: { lengthKm: 4.657, laps: 66, lapRecord: { time: '1:16.330', driver: 'Max Verstappen', year: 2023 }, facts: ['A long-time pre-season testing venue.'] },
  red_bull_ring: { lengthKm: 4.318, laps: 71, lapRecord: { time: '1:05.619', driver: 'Carlos Sainz', year: 2020 }, facts: ['One of the shortest laps on the calendar, set in the Styrian mountains.'] },
  silverstone: { lengthKm: 5.891, laps: 52, lapRecord: { time: '1:27.097', driver: 'Max Verstappen', year: 2020 }, facts: ['Hosted the very first World Championship race in 1950.', 'Fast corners like Maggotts and Becketts.'] },
  spa: { lengthKm: 7.004, laps: 44, lapRecord: { time: '1:44.701', driver: 'Valtteri Bottas', year: 2018 }, facts: ['The longest lap on the calendar.', 'Home of the legendary Eau Rouge–Raidillon.'] },
  hungaroring: { lengthKm: 4.381, laps: 70, lapRecord: { time: '1:16.627', driver: 'Lewis Hamilton', year: 2020 }, facts: ['Tight and twisty — often likened to a kart track.'] },
  zandvoort: { lengthKm: 4.259, laps: 72, lapRecord: { time: '1:11.097', driver: 'Lewis Hamilton', year: 2021 }, facts: ['Seaside track with steeply banked corners.'] },
  monza: { lengthKm: 5.793, laps: 53, lapRecord: { time: '1:21.046', driver: 'Rubens Barrichello', year: 2004 }, facts: ['“The Temple of Speed” — the fastest track on the calendar.'] },
  baku: { lengthKm: 6.003, laps: 51, lapRecord: { time: '1:43.009', driver: 'Charles Leclerc', year: 2019 }, facts: ['A street circuit with an ultra-long main straight.'] },
  marina_bay: { lengthKm: 4.94, laps: 62, lapRecord: { time: '1:34.486', driver: 'Lewis Hamilton', year: 2023 }, facts: ['A demanding night race on the streets of Singapore.'] },
  americas: { lengthKm: 5.513, laps: 56, lapRecord: { time: '1:36.169', driver: 'Charles Leclerc', year: 2019 }, facts: ['Its uphill Turn 1 is one of the sport’s great corners.'] },
  rodriguez: { lengthKm: 4.304, laps: 71, lapRecord: { time: '1:17.774', driver: 'Valtteri Bottas', year: 2021 }, facts: ['High altitude in Mexico City thins the air and the downforce.'] },
  interlagos: { lengthKm: 4.309, laps: 71, lapRecord: { time: '1:10.540', driver: 'Valtteri Bottas', year: 2018 }, facts: ['A short, anti-clockwise lap that often serves up drama.'] },
  vegas: { lengthKm: 6.201, laps: 50, lapRecord: { time: '1:35.490', driver: 'Oscar Piastri', year: 2023 }, facts: ['A night race straight down the Las Vegas Strip.'] },
  losail: { lengthKm: 5.419, laps: 57, lapRecord: { time: '1:24.319', driver: 'Max Verstappen', year: 2021 }, facts: ['A flowing, fast desert circuit run at night.'] },
  yas_marina: { lengthKm: 5.281, laps: 58, lapRecord: { time: '1:26.103', driver: 'Max Verstappen', year: 2021 }, facts: ['The traditional season finale, finishing under the lights.'] },
}

# Formula 1 team logos

Drop constructor logo files here to replace the fallback color badges on the
Teams and Team pages.

## Convention

- One file per team, named by its **Jolpica `constructorId`**:
  `public/f1/logos/<constructorId>.svg`
- The ids come from the live Jolpica feed (the 2026 grid):

  | Team | File |
  |------|------|
  | McLaren | `mclaren.svg` |
  | Mercedes | `mercedes.svg` |
  | Ferrari | `ferrari.svg` |
  | Red Bull | `red_bull.svg` |
  | Williams | `williams.svg` |
  | Aston Martin | `aston_martin.svg` |
  | Alpine | `alpine.svg` |
  | RB (Racing Bulls) | `rb.svg` |
  | Haas | `haas.svg` |
  | Audi | `audi.svg` |
  | Cadillac | `cadillac.svg` |

## Notes

- **SVG preferred** (sharp at any size). If you only have PNGs, change the
  extension in `src/f1/components/F1TeamLogo.jsx` (the `src` line) to `.png`.
- Files served from `public/` are available at the site root, so the app loads
  them from `f1/logos/<constructorId>.svg`.
- Until a file exists, the app shows a colored badge with the team's
  abbreviation — no errors; it upgrades automatically once the file is added.
- The full id list is whatever the feed returns; check `constructorId` values in
  `src/f1/data/snapshot.json` if the grid changes.
- **Licensing:** team and sponsor logos are trademarks of their owners. Make
  sure you have the right to use any logo you add here.

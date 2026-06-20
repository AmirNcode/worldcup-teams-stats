# Formula 1 team logos

Drop constructor logo files here to replace the fallback color badges on the
Teams and Team pages.

## Convention

- One file per team, named by its **slug**: `public/f1/logos/<slug>.svg`
- Slugs come from `src/f1/data/teams.js`:

  | Team | File |
  |------|------|
  | McLaren | `mclaren.svg` |
  | Mercedes | `mercedes.svg` |
  | Ferrari | `ferrari.svg` |
  | Red Bull Racing | `redbull.svg` |
  | Williams | `williams.svg` |
  | Aston Martin | `aston.svg` |
  | Kick Sauber | `sauber.svg` |
  | Haas | `haas.svg` |
  | Racing Bulls | `racingbulls.svg` |
  | Alpine | `alpine.svg` |

## Notes

- **SVG preferred** (sharp at any size). If you only have PNGs, change the
  extension in `src/f1/components/F1TeamLogo.jsx` (the `src` line) to `.png`.
- Files served from `public/` are available at the site root, so the app loads
  them from `f1/logos/<slug>.svg`.
- Until a file exists, the app shows a colored badge with the team's
  abbreviation — no errors, it upgrades automatically once the file is added.
- **Licensing:** team and sponsor logos are trademarks of their owners. Make
  sure you have the right to use any logo you add here.

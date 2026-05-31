# Chrono Gacha Sim

A static ChronoStory gachapon simulator built with React, TypeScript, and Vite.

## Resources / foundations

This project is based on public ChronoStory resources:

- [ChronoStory on MapleStory Worlds](https://maplestoryworlds.nexon.com/play/6697fa1ed9cd4de7bea6daffed99a637) — the game this simulator is for.
- [ChronoDEX](https://chronostorydex.com/) — public ChronoStory reference site and source of the linked official/community data used by the app.
- [Official Gachapon Table](https://docs.google.com/spreadsheets/d/e/2PACX-1vR_xZXUXsjc7kiktd4aAcNrvawk5sodq4gRxmz7Vt5gCK4xqwcHhPVHr1YJ57cUpnn0-trzKuEEFzyW/pubhtml) — public gachapon rates imported by `scripts/generate-gacha-data.mjs`.

## Live app

https://broccolo1d.github.io/chrono-gacha-sim/

## What it does

- Simulates rolls for the published ChronoStory gachapon towns.
- Uses the public official gachapon sheet as the source of item rows and weights.
- Normalizes `Chance` weights per town before sampling.
- Shows clean Maple-style result cards with item icons, stack counts, rarity, and category.
- Keeps run analytics in a bottom table: observed rate, source rate, `1/x`, and expected count.

Current generated dataset:

- 7 towns
- 1,177 official-sheet item rows
- Public MapleStory.IO item icons with fallback versions for items missing in GMS v83

## Tech stack

- React
- TypeScript
- Vite
- Vitest
- GitHub Pages

## Development

```bash
npm install
npm run data:gacha
npm run typecheck
npm test
npm run build
npm run dev
```

`npm run data:gacha` regenerates `src/data/chronoGacha.ts` from the public gachapon sheet.

## Project layout

```text
scripts/
  generate-gacha-data.mjs   # fetch and normalize the public gachapon sheet
src/
  components/               # UI components
  data/chronoGacha.ts        # generated dataset
  lib/sim/                   # weighted simulator and tests
  App.tsx
  styles.css
```

## Simulation notes

- Rolls are simulated locally in the browser.
- Each roll gets a fresh internal seed.
- Results are random samples, not predictions or guarantees.
- Source rates are derived from the imported public table weights.

## Boundaries

This is a public-data companion tool. It does not:

- connect to a Nexon or MapleStory Worlds account
- inspect the ChronoStory client
- automate gameplay
- use private/session APIs
- make guarantees about actual gachapon outcomes

Chrono Gacha Sim is an unofficial fan utility and is not affiliated with Nexon, MapleStory Worlds, or the ChronoStory team.

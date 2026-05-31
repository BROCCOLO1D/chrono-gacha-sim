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
- Provides a `Scroll Sim` tab for public-data equipment + scroll enhancement trials.
- Uses the public official gachapon sheet as the source of item rows and weights.
- Normalizes `Chance` weights per town before sampling.
- Shows clean Maple-style result cards with item icons, stack counts, rarity, and category.
- Keeps run analytics in a bottom table: observed rate, source rate, `1/x`, and expected count.

Current generated dataset:

- 7 towns
- 1,177 official-sheet item rows
- 1,405 ChronoDEX public equipment rows for Scroll Sim
- 396 ChronoDEX public scroll rows for Scroll Sim
- Public MapleStory.IO item icons with fallback versions for items missing in GMS v83

## Scroll Sim

Open the top-level `Scroll Sim` tab, search/select one equipment item, search/select one scroll, choose an attempt count, and run the simulation. The result shows the success/failure sequence, slot consumption when the equipment's public `tuc` slot count is available, final verified stat deltas, and source/unsupported-mechanics notes in a details section.

Scroll Sim data comes from public ChronoDEX static app data fetched by `scripts/generate-scroll-data.mjs` and checked into `src/data/chronoScroll.ts` for stable GitHub Pages use. The importer records the ChronoDEX asset URL and fetch timestamp in dataset metadata. Scroll success chances use ChronoDEX `scrollPercent`; scroll effects use numeric `metaInfo.inc*` fields; equipment slots use ChronoDEX `metaInfo.tuc` when present.

Unsupported/unverified mechanics are deliberately not guessed. The current simulator does **not** model destruction/boom behavior, special-case scroll rules, hidden ChronoStory mechanics, or stat/effect fields not represented in the public checked-in data. These limitations are also shown in the Scroll Sim UI.

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
npm run data:scroll
npm run typecheck
npm test
npm run build
npm run dev
```

`npm run data:gacha` regenerates `src/data/chronoGacha.ts` from the public gachapon sheet. `npm run data:scroll` regenerates `src/data/chronoScroll.ts` from public ChronoDEX static resources.

## Project layout

```text
scripts/
  generate-gacha-data.mjs   # fetch and normalize the public gachapon sheet
  generate-scroll-data.mjs  # fetch and normalize public ChronoDEX equipment/scroll data
src/
  components/               # UI components
  data/chronoGacha.ts        # generated dataset
  data/chronoScroll.ts       # generated Scroll Sim dataset
  lib/sim/                   # weighted simulator and tests
  lib/scroll/                # Scroll Sim pure utilities and tests
  App.tsx
  styles.css
```

## Simulation notes

- Rolls are simulated locally in the browser.
- Each roll gets a fresh internal seed.
- Results are random samples, not predictions or guarantees.
- Source rates are derived from the imported public table weights.
- Scroll Sim uses a fresh internal seed per run and deterministic pure utilities internally.

## Boundaries

This is a public-data companion tool. It does not:

- connect to a Nexon or MapleStory Worlds account
- inspect the ChronoStory client
- automate gameplay
- use private/session APIs
- make guarantees about actual gachapon outcomes

Chrono Gacha Sim is an unofficial fan utility and is not affiliated with Nexon, MapleStory Worlds, or the ChronoStory team.

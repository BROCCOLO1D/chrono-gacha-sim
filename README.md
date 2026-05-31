# Chrono Gacha Sim

Chrono Gacha Sim is a small web app for simulating ChronoStory gachapon pulls. Players should be able to pick a gachapon location, choose a ticket count like **"roll 50 tickets"**, and see a plausible simulated haul based on public ChronoStory gacha-rate data.

The app is for player planning/entertainment only. It does not interact with MapleStory Worlds, the ChronoStory client, accounts, sessions, or game traffic.

## Goal

Build a clean ChronoStory gacha simulator that answers:

- What might I get if I roll 10 / 50 / 100 tickets at a specific location?
- Which rare or valuable items appeared in this simulated run?
- What are the expected rates/value assumptions behind the output?
- How do different gacha locations compare?

## Data sources

Primary public/community resources:

- [ChronoDEX](https://chronostorydex.com/) — public ChronoStory reference site with gachapon pages, item/search data, rankings, and links to official/public resources.
- ChronoDEX-linked **Official Gachapon Table Google Sheet** — primary target for rates/location tables.
- ChronoDEX-linked official/public drop table, map data, and supporting docs where useful for item metadata.

Data ingestion rules:

- Use only public data that is accessible without private credentials.
- Store source URL and fetch timestamp for every imported dataset.
- Keep normalized data checked or cached in a transparent format when legally/reasonably allowed.
- Clearly label if a result is simulated from public rates vs. manually-entered/demo data.
- Current app data is generated from the ChronoDEX-linked official public gachapon sheet: 7 towns, 1,177 item rows.
- Do not scrape private Discord content or any authenticated ChronoStory/Nexon APIs.

## Planned tech stack

Default stack: **React + TypeScript + Vite**.

Rationale: this should be a simple, static-friendly web app with fast iteration and no backend requirement for v0.

Planned libraries/tools:

- React + TypeScript for UI.
- Vite for dev/build.
- CSS modules or lightweight Tailwind setup for styling.
- Vitest for simulator/math tests.
- Playwright or simple component tests later for core flows.
- Local JSON data generated from public sheets/site resources.
- Optional GitHub Actions for lint/typecheck/test/build.

Possible later upgrade:

- Next.js only if server-side fetching, scheduled regeneration, metadata routes, or deployment ergonomics justify it. Start with Vite unless there is a concrete need for Next.

## Core domain model

```ts
type GachaLocation = {
  id: string;
  name: string;
  sourceUrl: string;
};

type GachaItem = {
  id: string;
  name: string;
  category?: string;
  rarity?: string;
  iconUrl?: string;
  chronodexUrl?: string;
};

type GachaRate = {
  locationId: string;
  itemId: string;
  weight?: number;
  probability?: number;
  notes?: string;
  sourceUrl: string;
  fetchedAt: string;
};

type SimulatedPull = {
  itemId: string;
  rollIndex: number;
  probability?: number;
};
```

## Planned features

### v0.1 — minimal useful simulator

- Static React app shell.
- Official-sheet gacha town selector covering Lith Harbor, Henesys, Ellinia, Perion, Kerning City, Nautilus, and Omega Sector.
- Ticket-count input with presets: 1, 10, 35, 50, 100.
- Deterministic simulation engine accepting weighted/probability tables.
- Result summary:
  - item counts
  - rare hits
  - duplicate counts
  - official-sheet source rate, one-in odds, and expected count for each sampled result
- Unit tests for official-sheet import shape, weighted-roll correctness, and deterministic seeded runs.

### v0.2 — richer ChronoStory data

- Refresh/import script for the public ChronoDEX official gachapon sheet.
- Normalize locations, items, and rates into generated TypeScript data.
- Source metadata and fetch timestamp shown in UI.
- Search/filter results by item name/category/rarity.
- Link result items back to ChronoDEX when possible.

### v0.3 — player-facing polish

- Location comparison mode.
- "Roll until item" estimator.
- Expected number of tickets for selected target item.
- Shareable result seed/URL.
- Export simulated haul as image/text.
- Better rarity animations without pretending to be the actual game UI.

### Frontend assets

Use Maple-style item/inventory/result UI, not generic SaaS cards. Item icons are served from public MapleStory.IO GMS v83 item icon endpoints using the imported official-sheet item IDs, e.g. `https://maplestory.io/api/GMS/83/item/<itemId>/icon`.

Only use assets from official/publicly accessible sources where usage is acceptable. Keep text/fallback UI for missing/questionable assets, and do not bundle scraped private/authenticated assets.

## UX sketch

Primary screen:

1. Select gacha location.
2. Enter ticket count or click preset.
3. Click **Roll**.
4. Show animated-but-fast result reveal.
5. Show sortable summary table/cards.
6. Show source/rate metadata below results.

Secondary panels:

- Data freshness/source panel.
- Target item probability helper.
- Location comparison.
- About / disclaimer.

## Simulation notes

- If source data gives explicit probabilities, sample directly from cumulative probabilities.
- If source data gives weights, normalize weights per location.
- If data is incomplete, fail loudly in the UI instead of silently inventing rates.
- Support seeded randomness so shared simulations can be reproduced.
- Tests should cover:
  - total probability/weight validation
  - impossible/empty tables
  - deterministic seeded runs
  - large-run convergence sanity checks

## Safety / boundaries

This is a public-data web simulator. It should not:

- automate gameplay
- connect to a Nexon/MapleStory Worlds account
- inspect local game state
- use private/session APIs
- imply guaranteed gacha outcomes

All outputs are simulated estimates based on public/community data.

## Live deploy

Public GitHub Pages deployment target:

- https://broccolo1d.github.io/chrono-gacha-sim/

Every push to `main` runs typecheck, tests, and a production Vite build before deploying the `dist` artifact with GitHub Actions. The app is configured as a GitHub Pages project site with Vite `base: '/chrono-gacha-sim/'`.

## Development

```bash
npm install
npm run data:gacha
npm run typecheck
npm test
npm run build
npm run dev
```

## Development status

Initial Vite/React/TypeScript app scaffold is implemented with a deterministic weighted simulator, unit tests, demo-only fixture data, location picker, ticket presets, seed input, source metadata, and result summary. The included fixture is hand-authored demo data and **not real ChronoStory rates**; real ChronoDEX/official public sheet import remains the next milestone.

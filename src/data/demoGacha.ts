import type { GachaDataset } from '../lib/sim/types';

const demoSourceUrl = 'https://chronostorydex.com/';
const demoFetchedAt = '2026-05-31T00:00:00.000Z';

/**
 * Demo-only hand-authored fixture so the simulator can run before the public
 * ChronoDEX/official sheet importer is implemented. These are not real rates.
 */
export const demoGachaDataset: GachaDataset = {
  metadata: {
    label: 'Demo fixture — not real ChronoStory rates',
    sourceUrl: demoSourceUrl,
    fetchedAt: demoFetchedAt,
    isDemo: true,
  },
  locations: [
    { id: 'henesys-demo', name: 'Henesys Demo Gachapon', sourceUrl: demoSourceUrl },
    { id: 'kerning-demo', name: 'Kerning City Demo Gachapon', sourceUrl: demoSourceUrl },
  ],
  items: [
    {
      id: 'power-elixir',
      name: 'Power Elixir',
      category: 'Use',
      rarity: 'common',
      iconUrl: 'https://maplestory.io/api/GMS/83/item/2000005/icon',
    },
    {
      id: 'summoning-rock',
      name: 'Summoning Rock',
      category: 'Etc',
      rarity: 'common',
      iconUrl: 'https://maplestory.io/api/GMS/83/item/4006001/icon',
    },
    {
      id: 'work-gloves',
      name: 'Work Gloves',
      category: 'Equip',
      rarity: 'uncommon',
      iconUrl: 'https://maplestory.io/api/GMS/83/item/1082002/icon',
    },
    {
      id: 'brown-bamboo-hat',
      name: 'Brown Bamboo Hat',
      category: 'Equip',
      rarity: 'rare',
      iconUrl: 'https://maplestory.io/api/GMS/83/item/1002026/icon',
    },
    {
      id: 'pink-adventurer-cape',
      name: 'Pink Adventurer Cape',
      category: 'Equip',
      rarity: 'epic',
      iconUrl: 'https://maplestory.io/api/GMS/83/item/1102041/icon',
    },
    {
      id: 'chaos-scroll-demo',
      name: 'Chaos Scroll (Demo)',
      category: 'Scroll',
      rarity: 'legendary',
      iconUrl: 'https://maplestory.io/api/GMS/83/item/2049100/icon',
    },
  ],
  rates: [
    { locationId: 'henesys-demo', itemId: 'power-elixir', weight: 450, sourceUrl: demoSourceUrl, fetchedAt: demoFetchedAt },
    { locationId: 'henesys-demo', itemId: 'summoning-rock', weight: 250, sourceUrl: demoSourceUrl, fetchedAt: demoFetchedAt },
    { locationId: 'henesys-demo', itemId: 'work-gloves', weight: 180, sourceUrl: demoSourceUrl, fetchedAt: demoFetchedAt },
    { locationId: 'henesys-demo', itemId: 'brown-bamboo-hat', weight: 90, sourceUrl: demoSourceUrl, fetchedAt: demoFetchedAt },
    { locationId: 'henesys-demo', itemId: 'pink-adventurer-cape', weight: 25, sourceUrl: demoSourceUrl, fetchedAt: demoFetchedAt },
    { locationId: 'henesys-demo', itemId: 'chaos-scroll-demo', weight: 5, sourceUrl: demoSourceUrl, fetchedAt: demoFetchedAt },
    { locationId: 'kerning-demo', itemId: 'power-elixir', weight: 350, sourceUrl: demoSourceUrl, fetchedAt: demoFetchedAt },
    { locationId: 'kerning-demo', itemId: 'summoning-rock', weight: 350, sourceUrl: demoSourceUrl, fetchedAt: demoFetchedAt },
    { locationId: 'kerning-demo', itemId: 'work-gloves', weight: 140, sourceUrl: demoSourceUrl, fetchedAt: demoFetchedAt },
    { locationId: 'kerning-demo', itemId: 'brown-bamboo-hat', weight: 110, sourceUrl: demoSourceUrl, fetchedAt: demoFetchedAt },
    { locationId: 'kerning-demo', itemId: 'pink-adventurer-cape', weight: 40, sourceUrl: demoSourceUrl, fetchedAt: demoFetchedAt },
    { locationId: 'kerning-demo', itemId: 'chaos-scroll-demo', weight: 10, sourceUrl: demoSourceUrl, fetchedAt: demoFetchedAt },
  ],
};

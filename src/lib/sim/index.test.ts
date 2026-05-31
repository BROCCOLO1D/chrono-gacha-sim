import { describe, expect, it } from 'vitest';
import { chronoGachaDataset } from '../../data/chronoGacha';
import { calculateAtLeastOneChance, normalizeRates, simulateRolls, summarizePulls } from './index';
import type { GachaDataset } from './types';

const expectedTownCounts = new Map([
  ['lith-harbor', 114],
  ['henesys', 200],
  ['ellinia', 180],
  ['perion', 269],
  ['kerning-city', 242],
  ['nautilus', 56],
  ['omega-sector', 116],
]);

describe('gacha simulator', () => {
  it('imports every public ChronoStory gachapon town from the official sheet', () => {
    expect(chronoGachaDataset.metadata.isDemo).toBe(false);
    expect(chronoGachaDataset.locations.map((location) => location.id)).toEqual([...expectedTownCounts.keys()]);

    for (const location of chronoGachaDataset.locations) {
      expect(location.itemCount).toBe(expectedTownCounts.get(location.id));
      expect(chronoGachaDataset.rates.filter((rate) => rate.locationId === location.id)).toHaveLength(location.itemCount ?? 0);
      expect(location.sourceUrl).toContain('docs.google.com/spreadsheets');
    }
  });

  it('normalizes official sheet weight tables to probabilities totaling 1', () => {
    for (const location of chronoGachaDataset.locations) {
      const normalized = normalizeRates(chronoGachaDataset.rates, location.id);
      const total = normalized.reduce((sum, rate) => sum + rate.probability, 0);
      expect(total).toBeCloseTo(1, 8);
    }

    const lith = normalizeRates(chronoGachaDataset.rates, 'lith-harbor');
    const goldEmerald = lith.find((rate) => rate.itemId === '1032026');
    expect(goldEmerald?.oneIn).toBeCloseTo(1397.48488, 5);
    expect(goldEmerald?.probability).toBeCloseTo(12500 / 17468561, 12);
  });

  it('produces deterministic seeded runs', () => {
    const firstRun = simulateRolls(chronoGachaDataset, 'kerning-city', 50, 'seed-A');
    const secondRun = simulateRolls(chronoGachaDataset, 'kerning-city', 50, 'seed-A');
    const differentSeedRun = simulateRolls(chronoGachaDataset, 'kerning-city', 50, 'seed-B');

    expect(secondRun).toEqual(firstRun);
    expect(differentSeedRun).not.toEqual(firstRun);
  });

  it('summarizes counts, source rates, one-in odds, and expected counts', () => {
    const pulls = simulateRolls(chronoGachaDataset, 'henesys', 100, 'summary-test');
    const summary = summarizePulls(chronoGachaDataset, 'henesys', pulls);

    expect(summary.reduce((sum, row) => sum + row.count, 0)).toBe(100);
    expect(summary.every((row) => row.probability > 0 && row.sourceUrl.startsWith('https://'))).toBe(true);
    expect(summary.every((row) => row.oneIn && row.oneIn > 0)).toBe(true);
    expect(summary.every((row) => row.expectedCount > 0)).toBe(true);
  });

  it('calculates target-item odds for at least one hit across a ticket stack', () => {
    const lith = normalizeRates(chronoGachaDataset.rates, 'lith-harbor');
    const goldEmerald = lith.find((rate) => rate.itemId === '1032026');

    expect(goldEmerald?.probability).toBeCloseTo(12500 / 17468561, 12);
    expect(calculateAtLeastOneChance(goldEmerald?.probability ?? 0, 100)).toBeCloseTo(0.069080749, 9);
    expect(calculateAtLeastOneChance(0.5, 2)).toBe(0.75);
  });

  it('fails loudly for incomplete/invalid probability tables', () => {
    const invalidDataset: GachaDataset = {
      ...chronoGachaDataset,
      rates: [
        { locationId: 'bad', itemId: '2000005', probability: 0.25, sourceUrl: 'https://example.test', fetchedAt: '2026-05-31T00:00:00.000Z' },
        { locationId: 'bad', itemId: '4006001', probability: 0.25, sourceUrl: 'https://example.test', fetchedAt: '2026-05-31T00:00:00.000Z' },
      ],
    };

    expect(() => normalizeRates(invalidDataset.rates, 'bad')).toThrow(/must total 1/);
  });
});

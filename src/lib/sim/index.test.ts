import { describe, expect, it } from 'vitest';
import { demoGachaDataset } from '../../data/demoGacha';
import { normalizeRates, simulateRolls, summarizePulls } from './index';
import type { GachaDataset } from './types';

describe('gacha simulator', () => {
  it('normalizes weight tables to probabilities totaling 1', () => {
    const normalized = normalizeRates(demoGachaDataset.rates, 'henesys-demo');
    const total = normalized.reduce((sum, rate) => sum + rate.probability, 0);

    expect(total).toBeCloseTo(1, 8);
    expect(normalized.find((rate) => rate.itemId === 'chaos-scroll-demo')?.probability).toBeCloseTo(0.005, 8);
  });

  it('produces deterministic seeded runs', () => {
    const firstRun = simulateRolls(demoGachaDataset, 'kerning-demo', 50, 'seed-A');
    const secondRun = simulateRolls(demoGachaDataset, 'kerning-demo', 50, 'seed-A');
    const differentSeedRun = simulateRolls(demoGachaDataset, 'kerning-demo', 50, 'seed-B');

    expect(secondRun).toEqual(firstRun);
    expect(differentSeedRun).not.toEqual(firstRun);
  });

  it('summarizes counts and source probabilities', () => {
    const pulls = simulateRolls(demoGachaDataset, 'henesys-demo', 10, 'summary-test');
    const summary = summarizePulls(demoGachaDataset, 'henesys-demo', pulls);

    expect(summary.reduce((sum, row) => sum + row.count, 0)).toBe(10);
    expect(summary.every((row) => row.probability > 0 && row.sourceUrl.startsWith('https://'))).toBe(true);
  });

  it('fails loudly for incomplete/invalid probability tables', () => {
    const invalidDataset: GachaDataset = {
      ...demoGachaDataset,
      rates: [
        { locationId: 'bad', itemId: 'power-elixir', probability: 0.25, sourceUrl: 'https://example.test', fetchedAt: '2026-05-31T00:00:00.000Z' },
        { locationId: 'bad', itemId: 'summoning-rock', probability: 0.25, sourceUrl: 'https://example.test', fetchedAt: '2026-05-31T00:00:00.000Z' },
      ],
    };

    expect(() => normalizeRates(invalidDataset.rates, 'bad')).toThrow(/must total 1/);
  });
});

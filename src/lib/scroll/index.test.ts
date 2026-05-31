import { describe, expect, it } from 'vitest';
import { simulateScrolling } from './index';
import type { ScrollEquipment, ScrollItem } from './types';

const equipment: ScrollEquipment = { id: '1002004', name: 'Great Brown Helmet', category: 'Helmet', slots: 7 };
const scroll: ScrollItem = {
  id: '2040000',
  name: 'Scroll for Helmet for Defense 100%',
  category: 'Helmet',
  successChance: 100,
  effects: { PDD: 1, MDD: 1 },
};

describe('simulateScrolling', () => {
  it('applies verified 100% scroll effects and consumes slots', () => {
    const result = simulateScrolling(equipment, scroll, 3, 'fixed-seed');
    expect(result.successes).toBe(3);
    expect(result.failures).toBe(0);
    expect(result.remainingSlots).toBe(4);
    expect(result.finalDeltas).toEqual({ PDD: 3, MDD: 3 });
  });

  it('is deterministic for a given seed', () => {
    const tenPercent = { ...scroll, successChance: 10 };
    const first = simulateScrolling(equipment, tenPercent, 7, 'same-seed');
    const second = simulateScrolling(equipment, tenPercent, 7, 'same-seed');
    expect(second.sequence).toEqual(first.sequence);
    expect(second.finalDeltas).toEqual(first.finalDeltas);
  });

  it('does not apply more attempts than verified slots', () => {
    const result = simulateScrolling({ ...equipment, slots: 2 }, scroll, 5, 'slot-seed');
    expect(result.attemptsRequested).toBe(5);
    expect(result.attemptsApplied).toBe(2);
    expect(result.sequence).toHaveLength(2);
    expect(result.remainingSlots).toBe(0);
  });

  it('allows manual attempts when slots are unknown', () => {
    const result = simulateScrolling({ ...equipment, slots: undefined }, scroll, 4, 'unknown-slots');
    expect(result.attemptsApplied).toBe(4);
    expect(result.remainingSlots).toBeUndefined();
  });

  it('rejects invalid attempt counts and unverifiable chance data', () => {
    expect(() => simulateScrolling(equipment, scroll, 0, 'seed')).toThrow(/at least one/);
    expect(() => simulateScrolling(equipment, { ...scroll, successChance: undefined }, 1, 'seed')).toThrow(/success chance/);
    expect(() => simulateScrolling(equipment, { ...scroll, successChance: 120 }, 1, 'seed')).toThrow(/success chance/);
  });
});

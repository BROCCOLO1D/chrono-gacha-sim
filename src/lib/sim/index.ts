import type { GachaDataset, GachaItem, GachaRate, ResultSummaryRow, SimulatedPull } from './types';
import { createSeededRandom } from './random';

const PROBABILITY_TOLERANCE = 0.000001;

type NormalizedRate = Required<Pick<GachaRate, 'locationId' | 'itemId' | 'sourceUrl' | 'fetchedAt'>> & {
  probability: number;
  weight?: number;
  sourcePercent?: string;
  oneIn?: number;
};

function assertPositiveFinite(value: number | undefined, label: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive finite number.`);
  }
}

function validateUniqueRates(rates: GachaRate[], locationId: string) {
  const seen = new Set<string>();
  for (const rate of rates) {
    if (seen.has(rate.itemId)) {
      throw new Error(`Location "${locationId}" has duplicate rate row for item "${rate.itemId}".`);
    }
    seen.add(rate.itemId);
  }
}

export function normalizeRates(rates: GachaRate[], locationId: string): NormalizedRate[] {
  const locationRates = rates.filter((rate) => rate.locationId === locationId);

  if (locationRates.length === 0) {
    throw new Error(`No gacha rates found for location "${locationId}".`);
  }

  validateUniqueRates(locationRates, locationId);

  const probabilityRates = locationRates.filter((rate) => rate.probability !== undefined);
  const weightRates = locationRates.filter((rate) => rate.weight !== undefined);

  if (probabilityRates.length > 0 && weightRates.length > 0) {
    throw new Error(`Location "${locationId}" mixes probability and weight rates; use one representation.`);
  }

  if (probabilityRates.length > 0) {
    const total = probabilityRates.reduce((sum, rate) => {
      assertPositiveFinite(rate.probability, `Probability for ${rate.itemId}`);
      return sum + rate.probability;
    }, 0);

    if (Math.abs(total - 1) > PROBABILITY_TOLERANCE) {
      throw new Error(`Probabilities for "${locationId}" must total 1. Received ${total}.`);
    }

    return probabilityRates.map((rate) => ({
      locationId: rate.locationId,
      itemId: rate.itemId,
      probability: rate.probability as number,
      sourceUrl: rate.sourceUrl,
      fetchedAt: rate.fetchedAt,
      sourcePercent: rate.sourcePercent,
      oneIn: rate.oneIn ?? 1 / (rate.probability as number),
    }));
  }

  const totalWeight = weightRates.reduce((sum, rate) => {
    assertPositiveFinite(rate.weight, `Weight for ${rate.itemId}`);
    return sum + rate.weight;
  }, 0);

  if (weightRates.length !== locationRates.length || totalWeight <= 0) {
    throw new Error(`Location "${locationId}" must provide a complete positive weight table.`);
  }

  return weightRates.map((rate) => {
    const probability = (rate.weight as number) / totalWeight;
    return {
      locationId: rate.locationId,
      itemId: rate.itemId,
      probability,
      weight: rate.weight,
      sourceUrl: rate.sourceUrl,
      fetchedAt: rate.fetchedAt,
      sourcePercent: rate.sourcePercent,
      oneIn: rate.oneIn ?? 1 / probability,
    };
  });
}

export function calculateAtLeastOneChance(probability: number, rolls: number): number {
  assertPositiveFinite(probability, 'Probability');
  if (probability > 1) throw new Error('Probability must be no greater than 1.');
  if (!Number.isInteger(rolls) || rolls < 1) throw new Error('Roll count must be a positive integer.');
  return 1 - (1 - probability) ** rolls;
}

export function rollOne(normalizedRates: NormalizedRate[], random: () => number): NormalizedRate {
  if (normalizedRates.length === 0) {
    throw new Error('Cannot roll against an empty rate table.');
  }

  const threshold = random();
  let cumulative = 0;

  for (const rate of normalizedRates) {
    cumulative += rate.probability;
    if (threshold < cumulative) {
      return rate;
    }
  }

  return normalizedRates.at(-1) as NormalizedRate;
}

export function simulateRolls(dataset: GachaDataset, locationId: string, ticketCount: number, seed: string): SimulatedPull[] {
  if (!Number.isInteger(ticketCount) || ticketCount < 1 || ticketCount > 100_000) {
    throw new Error('Ticket count must be an integer from 1 to 100,000.');
  }

  const normalizedRates = normalizeRates(dataset.rates, locationId);
  const random = createSeededRandom(`${locationId}:${ticketCount}:${seed}`);

  return Array.from({ length: ticketCount }, (_, index) => {
    const rate = rollOne(normalizedRates, random);
    return {
      itemId: rate.itemId,
      rollIndex: index + 1,
      probability: rate.probability,
    };
  });
}

export function summarizePulls(dataset: GachaDataset, locationId: string, pulls: SimulatedPull[]): ResultSummaryRow[] {
  const itemsById = new Map<string, GachaItem>(dataset.items.map((item) => [item.id, item]));
  const ratesByItemId = new Map(normalizeRates(dataset.rates, locationId).map((rate) => [rate.itemId, rate]));
  const counts = new Map<string, number>();

  for (const pull of pulls) {
    counts.set(pull.itemId, (counts.get(pull.itemId) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([itemId, count]) => {
      const item = itemsById.get(itemId);
      const rate = ratesByItemId.get(itemId);
      if (!item || !rate) {
        throw new Error(`Simulated result references missing item/rate "${itemId}".`);
      }

      return {
        item,
        count,
        rarity: item.rarity,
        category: item.category,
        probability: rate.probability,
        sourceUrl: rate.sourceUrl,
        sourcePercent: rate.sourcePercent,
        oneIn: rate.oneIn,
        expectedCount: rate.probability * pulls.length,
      };
    })
    .sort((a, b) => b.count - a.count || a.item.name.localeCompare(b.item.name));
}

export function getLocationStats(dataset: GachaDataset, locationId: string) {
  const rates = normalizeRates(dataset.rates, locationId);
  const firstRate = rates[0] as NormalizedRate | undefined;
  if (!firstRate) {
    throw new Error(`No normalized rates found for location "${locationId}".`);
  }

  const rarest = rates.reduce<NormalizedRate>((min, rate) => (rate.probability < min.probability ? rate : min), firstRate);
  const mostCommon = rates.reduce<NormalizedRate>((max, rate) => (rate.probability > max.probability ? rate : max), firstRate);

  return {
    itemCount: rates.length,
    totalProbability: rates.reduce((sum, rate) => sum + rate.probability, 0),
    rarest,
    mostCommon,
  };
}

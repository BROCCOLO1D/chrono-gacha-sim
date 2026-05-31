import type { ScrollEquipment, ScrollItem, ScrollSimulationResult, ScrollStatDeltas } from './types';

function cyrb128(seed: string): [number, number, number, number] {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0; i < seed.length; i += 1) {
    const k = seed.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
}

function sfc32(a: number, b: number, c: number, d: number): () => number {
  return () => {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    const t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    const result = (t + d) | 0;
    c = (c + result) | 0;
    return (result >>> 0) / 4294967296;
  };
}

function addDeltas(a: ScrollStatDeltas, b: ScrollStatDeltas): ScrollStatDeltas {
  const next = { ...a };
  for (const [stat, value] of Object.entries(b)) {
    next[stat] = (next[stat] ?? 0) + value;
  }
  return next;
}

function validateChance(scroll: ScrollItem): number {
  const chance = scroll.successChance;
  if (chance === undefined || !Number.isFinite(chance) || chance < 0 || chance > 100) {
    throw new Error(`Scroll ${scroll.name} does not have a verified 0-100 success chance.`);
  }
  return chance;
}

export function makeScrollSeed(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function simulateScrolling(
  equipment: ScrollEquipment,
  scroll: ScrollItem,
  requestedAttempts: number,
  seed: string,
): ScrollSimulationResult {
  if (!Number.isInteger(requestedAttempts) || requestedAttempts < 1) {
    throw new Error('Scroll simulation requires at least one attempt.');
  }
  const chance = validateChance(scroll);
  const supportedDeltas = Object.fromEntries(Object.entries(scroll.effects).filter(([, value]) => Number.isFinite(value)));
  const slotLimit = equipment.slots;
  const attemptsApplied = slotLimit === undefined ? requestedAttempts : Math.min(requestedAttempts, Math.max(0, slotLimit));
  const rng = sfc32(...cyrb128(seed));
  let finalDeltas: ScrollStatDeltas = {};
  let successes = 0;
  let remainingSlots = slotLimit;
  const sequence = Array.from({ length: attemptsApplied }, (_, index) => {
    const roll = rng() * 100;
    const success = roll < chance;
    if (remainingSlots !== undefined) remainingSlots = Math.max(0, remainingSlots - 1);
    const statDeltas = success ? supportedDeltas : {};
    if (success) {
      successes += 1;
      finalDeltas = addDeltas(finalDeltas, statDeltas);
    }
    return {
      attempt: index + 1,
      roll,
      success,
      statDeltas,
      remainingSlots,
    };
  });

  const unsupportedNotes = [
    'Only public ChronoDEX success chance, equipment slots, and inc* stat deltas are simulated.',
  ];
  if (!Object.keys(supportedDeltas).length) unsupportedNotes.push('This scroll has no verified stat delta in the imported public data.');
  unsupportedNotes.push('Destruction/boom behavior, special-case scroll rules, and hidden ChronoStory mechanics are not simulated because they are not represented in this public checked-in dataset.');

  return {
    equipment,
    scroll,
    attemptsRequested: requestedAttempts,
    attemptsApplied,
    successes,
    failures: attemptsApplied - successes,
    remainingSlots,
    finalDeltas,
    sequence,
    unsupportedNotes,
  };
}

export function formatStatName(stat: string): string {
  const labels: Record<string, string> = {
    STR: 'STR',
    DEX: 'DEX',
    INT: 'INT',
    LUK: 'LUK',
    PAD: 'Weapon ATT',
    MAD: 'Magic ATT',
    PDD: 'Weapon DEF',
    MDD: 'Magic DEF',
    MHP: 'MaxHP',
    MMP: 'MaxMP',
    ACC: 'Accuracy',
    EVA: 'Avoidability',
    Speed: 'Speed',
    Jump: 'Jump',
  };
  return labels[stat] ?? stat;
}

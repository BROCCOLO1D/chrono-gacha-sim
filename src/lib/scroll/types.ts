export type ScrollStatDeltas = Record<string, number>;

export type ScrollEquipment = {
  id: string;
  mapleItemId?: number;
  name: string;
  category: string;
  slots?: number;
  reqLevel?: number;
  iconUrl?: string;
  chronodexUrl?: string;
};

export type ScrollItem = {
  id: string;
  mapleItemId?: number;
  name: string;
  category: string;
  scrollType?: string;
  successChance?: number;
  effects: ScrollStatDeltas;
  description?: string;
  iconUrl?: string;
  chronodexUrl?: string;
};

export type ScrollSimDataset = {
  equipment: ScrollEquipment[];
  scrolls: ScrollItem[];
  metadata: {
    label: string;
    sourceUrl: string;
    assetUrl?: string;
    fetchedAt: string;
    notes: string[];
  };
};

export type ScrollAttempt = {
  attempt: number;
  roll: number;
  success: boolean;
  statDeltas: ScrollStatDeltas;
  remainingSlots?: number;
};

export type ScrollSimulationResult = {
  equipment: ScrollEquipment;
  scroll: ScrollItem;
  attemptsRequested: number;
  attemptsApplied: number;
  successes: number;
  failures: number;
  remainingSlots?: number;
  finalDeltas: ScrollStatDeltas;
  sequence: ScrollAttempt[];
  unsupportedNotes: string[];
};

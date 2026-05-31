export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type GachaItem = {
  id: string;
  name: string;
  category?: string;
  rarity?: Rarity;
  iconUrl?: string;
  chronodexUrl?: string;
};

export type GachaRate = {
  locationId: string;
  itemId: string;
  weight?: number;
  probability?: number;
  notes?: string;
  sourceUrl: string;
  fetchedAt: string;
};

export type GachaLocation = {
  id: string;
  name: string;
  sourceUrl: string;
};

export type GachaDataset = {
  locations: GachaLocation[];
  items: GachaItem[];
  rates: GachaRate[];
  metadata: {
    label: string;
    sourceUrl: string;
    fetchedAt: string;
    isDemo: boolean;
  };
};

export type SimulatedPull = {
  itemId: string;
  rollIndex: number;
  probability: number;
};

export type ResultSummaryRow = {
  item: GachaItem;
  count: number;
  rarity?: Rarity;
  category?: string;
  probability: number;
  sourceUrl: string;
};

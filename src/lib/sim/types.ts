export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type Category = 'Equip' | 'Use' | 'Setup' | 'Etc' | 'Cash' | 'Scroll' | 'Unknown';

export type GachaItem = {
  id: string;
  name: string;
  category?: Category;
  rarity?: Rarity;
  iconUrl?: string;
  assetSourceUrl?: string;
  mapleItemId?: number;
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
  sourcePercent?: string;
  oneIn?: number;
};

export type GachaLocation = {
  id: string;
  name: string;
  sourceUrl: string;
  sheetName?: string;
  itemCount?: number;
  totalWeight?: number;
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
  sourcePercent?: string;
  oneIn?: number;
  expectedCount: number;
};

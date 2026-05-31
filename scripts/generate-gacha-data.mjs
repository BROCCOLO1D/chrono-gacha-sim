import fs from 'node:fs';
import path from 'node:path';

const SHEET_BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR_xZXUXsjc7kiktd4aAcNrvawk5sodq4gRxmz7Vt5gCK4xqwcHhPVHr1YJ57cUpnn0-trzKuEEFzyW';
const PUBLIC_BASE = `${SHEET_BASE}/pub`;
const PUBLIC_HTML = `${SHEET_BASE}/pubhtml`;

const SHEETS = [
  { id: 'lith-harbor', name: 'Lith Harbor', sheetName: 'LithHarborGachapon', gid: '1131782307' },
  { id: 'henesys', name: 'Henesys', sheetName: 'HenesysGachapon', gid: '1497972303' },
  { id: 'ellinia', name: 'Ellinia', sheetName: 'ElliniaGachapon', gid: '1155991176' },
  { id: 'perion', name: 'Perion', sheetName: 'PerionGachapon', gid: '1341584885' },
  { id: 'kerning-city', name: 'Kerning City', sheetName: 'KerningCityGachapon', gid: '1450283032' },
  { id: 'nautilus', name: 'Nautilus', sheetName: 'NautilusGachapon', gid: '1720390663' },
  { id: 'omega-sector', name: 'Omega Sector', sheetName: 'OmegaSectorGachapon', gid: '2099781933' },
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.replace(/\r$/, ''));
    rows.push(row);
  }

  const [headers, ...records] = rows.filter((candidate) => candidate.some((value) => value.trim() !== ''));
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ''])));
}

function categoryFromItemId(itemId) {
  const prefix = Math.floor(Number(itemId) / 1_000_000);
  switch (prefix) {
    case 1:
      return 'Equip';
    case 2:
      return 'Use';
    case 3:
      return 'Setup';
    case 4:
      return 'Etc';
    case 5:
      return 'Cash';
    default:
      return 'Unknown';
  }
}

function rarityFromProbability(probability) {
  if (probability <= 0.001) return 'legendary';
  if (probability <= 0.0025) return 'epic';
  if (probability <= 0.005) return 'rare';
  if (probability <= 0.01) return 'uncommon';
  return 'common';
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function fetchCsv(gid) {
  const response = await fetch(`${PUBLIC_BASE}?gid=${gid}&single=true&output=csv`);
  if (!response.ok) throw new Error(`Failed to fetch gid ${gid}: ${response.status}`);
  return response.text();
}

const fetchedAt = new Date().toISOString();
const itemsById = new Map();
const locations = [];
const rates = [];

for (const sheet of SHEETS) {
  const sourceUrl = `${PUBLIC_HTML}?gid=${sheet.gid}`;
  const rows = parseCsv(await fetchCsv(sheet.gid));
  const validRows = rows.filter((row) => row.Chance && row.ItemID && (row.Description || row.Name));
  const totalWeight = validRows.reduce((sum, row) => sum + Number(row.Chance), 0);

  if (!Number.isFinite(totalWeight) || totalWeight <= 0) {
    throw new Error(`${sheet.name} has invalid total chance ${totalWeight}`);
  }

  locations.push({
    id: sheet.id,
    name: sheet.name,
    sourceUrl,
    sheetName: sheet.sheetName,
    itemCount: validRows.length,
    totalWeight,
  });

  for (const row of validRows) {
    const itemId = row.ItemID.trim();
    const mapleItemId = Number(itemId);
    const name = (row.Description || row.Name).trim();
    const weight = Number(row.Chance);
    const probability = weight / totalWeight;

    if (!Number.isInteger(mapleItemId) || !Number.isFinite(weight) || weight <= 0 || !name) {
      throw new Error(`Invalid row in ${sheet.name}: ${JSON.stringify(row)}`);
    }

    if (!itemsById.has(itemId)) {
      itemsById.set(itemId, {
        id: itemId,
        name,
        category: categoryFromItemId(itemId),
        rarity: rarityFromProbability(probability),
        iconUrl: `https://maplestory.io/api/GMS/83/item/${itemId}/icon`,
        assetSourceUrl: 'https://maplestory.io/',
        mapleItemId,
      });
    }

    rates.push({
      locationId: sheet.id,
      itemId,
      weight,
      sourceUrl,
      fetchedAt,
      sourcePercent: row.Percent?.trim(),
      oneIn: totalWeight / weight,
    });
  }
}

const dataset = {
  metadata: {
    label: 'Official ChronoStory gachapon table import',
    sourceUrl: PUBLIC_HTML,
    fetchedAt,
    isDemo: false,
  },
  locations,
  items: [...itemsById.values()].sort((a, b) => Number(a.id) - Number(b.id)),
  rates,
};

const out = `import type { GachaDataset } from '../lib/sim/types';\n\n` +
  `// Generated by scripts/generate-gacha-data.mjs from the public ChronoStory Official Gachapon Table Google Sheet.\n` +
  `// Do not hand-edit item/rate rows; update the generator or source sheet import instead.\n` +
  `export const chronoGachaDataset: GachaDataset = ${JSON.stringify(dataset, null, 2)};\n`;

const target = path.resolve('src/data/chronoGacha.ts');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, out);

console.log(`Generated ${locations.length} towns, ${itemsById.size} unique items, ${rates.length} rates -> ${target}`);

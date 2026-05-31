import { useEffect, useMemo, useState } from 'react';
import { ItemIcon } from './ItemIcon';
import { calculateAtLeastOneChance, normalizeRates } from '../lib/sim';
import type { GachaDataset } from '../lib/sim/types';

type TargetOddsPanelProps = {
  dataset: GachaDataset;
  locationId: string;
  ticketCount: number;
};

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '—';
  if (value < 0.0001) return `${(value * 100).toFixed(4)}%`;
  if (value < 0.001) return `${(value * 100).toFixed(3)}%`;
  if (value < 0.01) return `${(value * 100).toFixed(2)}%`;
  return `${(value * 100).toFixed(1)}%`;
}

function formatOneIn(value?: number): string {
  if (!value || !Number.isFinite(value)) return '—';
  if (value >= 100) return `1/${Math.round(value).toLocaleString()}`;
  return `1/${value.toFixed(1)}`;
}

const rarityWeight = new Map([
  ['legendary', 5],
  ['epic', 4],
  ['rare', 3],
  ['uncommon', 2],
  ['common', 1],
]);

export function TargetOddsPanel({ dataset, locationId, ticketCount }: TargetOddsPanelProps) {
  const [query, setQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const itemsById = new Map(dataset.items.map((item) => [item.id, item]));
    return normalizeRates(dataset.rates, locationId)
      .map((rate) => {
        const item = itemsById.get(rate.itemId);
        if (!item) throw new Error(`Missing item metadata for ${rate.itemId}.`);
        return { item, rate };
      })
      .sort((a, b) => {
        const rarityDelta = (rarityWeight.get(b.item.rarity ?? 'common') ?? 0) - (rarityWeight.get(a.item.rarity ?? 'common') ?? 0);
        return rarityDelta || a.item.name.localeCompare(b.item.name);
      });
  }, [dataset, locationId]);

  useEffect(() => {
    setSelectedItemId((current) => (current && rows.some((row) => row.item.id === current) ? current : (rows[0]?.item.id ?? null)));
  }, [rows]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredRows = rows
    .filter(({ item }) => {
      if (!normalizedQuery) return true;
      return [item.name, item.id, item.mapleItemId?.toString(), item.category, item.rarity]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));
    })
    .slice(0, 48);

  const selected = rows.find((row) => row.item.id === selectedItemId) ?? rows[0];
  const singleRollChance = selected?.rate.probability ?? 0;
  const atLeastOneChance = singleRollChance > 0 ? calculateAtLeastOneChance(singleRollChance, ticketCount) : 0;
  const expectedHits = singleRollChance * ticketCount;

  return (
    <section className="maple-window target-odds" aria-labelledby="target-odds-heading">
      <div className="maple-titlebar">
        <span id="target-odds-heading">Target Item Odds</span>
        <span className="maple-titlebar__buttons" aria-hidden="true">● ● ●</span>
      </div>
      <div className="window-body target-odds__body">
        <label className="field target-odds__search">
          <span>Search this town table</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Item name, ID, category, rarity…"
          />
        </label>

        {selected ? (
          <div className="target-odds__selected">
            <ItemIcon item={selected.item} size="lg" />
            <div>
              <h2>{selected.item.name}</h2>
              <div className="inventory-card__meta">
                <span className={`rarity ${selected.item.rarity ?? 'common'}`}>{selected.item.rarity ?? 'unknown'}</span>
                <span>{selected.item.category ?? '—'}</span>
              </div>
            </div>
            <dl className="target-odds__stats" aria-label="Target item probability details">
              <div>
                <dt>Chance in {ticketCount.toLocaleString()} rolls</dt>
                <dd>{formatPercent(atLeastOneChance)}</dd>
              </div>
              <div>
                <dt>Per roll</dt>
                <dd>{formatPercent(singleRollChance)}</dd>
              </div>
              <div>
                <dt>Official source</dt>
                <dd><a href={selected.rate.sourceUrl}>{selected.rate.sourcePercent ?? formatOneIn(selected.rate.oneIn)}</a></dd>
              </div>
              <div>
                <dt>Expected hits</dt>
                <dd>{expectedHits.toFixed(expectedHits < 1 ? 3 : 1)}</dd>
              </div>
            </dl>
          </div>
        ) : null}

        <div className="target-odds__list" aria-label="Matching target items">
          {filteredRows.map(({ item, rate }) => (
            <button
              key={item.id}
              type="button"
              className={item.id === selected?.item.id ? 'target-odds__item active' : 'target-odds__item'}
              onClick={() => setSelectedItemId(item.id)}
            >
              <ItemIcon item={item} size="sm" />
              <span>{item.name}</span>
              <small>{formatOneIn(rate.oneIn)}</small>
            </button>
          ))}
        </div>
        <p className="muted target-odds__note">
          Target odds are calculated from the official sheet Chance weights normalized within the selected town. Run results below remain sampled rolls.
        </p>
      </div>
    </section>
  );
}

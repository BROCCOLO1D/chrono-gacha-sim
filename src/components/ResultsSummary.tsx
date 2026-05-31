import { ItemIcon } from './ItemIcon';
import type { ResultSummaryRow } from '../lib/sim/types';

const rarityRank = new Map([
  ['legendary', 5],
  ['epic', 4],
  ['rare', 3],
  ['uncommon', 2],
  ['common', 1],
]);

type ResultsSummaryProps = {
  rows: ResultSummaryRow[];
  ticketCount: number;
  locationName: string;
};

function sortByRarityThenCount(a: ResultSummaryRow, b: ResultSummaryRow) {
  return (
    (rarityRank.get(b.rarity ?? 'common') ?? 0) - (rarityRank.get(a.rarity ?? 'common') ?? 0) ||
    b.count - a.count ||
    a.item.name.localeCompare(b.item.name)
  );
}

function formatPercent(value: number): string {
  if (value < 0.0001) return `${(value * 100).toFixed(4)}%`;
  if (value < 0.001) return `${(value * 100).toFixed(3)}%`;
  return `${(value * 100).toFixed(2)}%`;
}

function formatOneIn(value?: number): string {
  if (!value || !Number.isFinite(value)) return '—';
  if (value >= 100) return `1/${Math.round(value).toLocaleString()}`;
  return `1/${value.toFixed(1)}`;
}

export function ResultsSummary({ rows, ticketCount, locationName }: ResultsSummaryProps) {
  const rareHits = rows.filter((row) => (rarityRank.get(row.rarity ?? 'common') ?? 0) >= 3).sort(sortByRarityThenCount);
  const sortedRows = [...rows].sort(sortByRarityThenCount);
  const totalStacks = rows.length;
  const rareHitCount = rareHits.reduce((sum, row) => sum + row.count, 0);

  return (
    <section className="maple-window results" aria-labelledby="results-heading">
      <div className="maple-titlebar">
        <span id="results-heading">{locationName} Results</span>
        <span className="maple-titlebar__buttons" aria-hidden="true">● ● ●</span>
      </div>

      <div className="results-ledger">
        <div>
          <span className="ledger-label">Tickets</span>
          <strong>{ticketCount.toLocaleString()}</strong>
        </div>
        <div>
          <span className="ledger-label">Unique stacks</span>
          <strong>{totalStacks}</strong>
        </div>
        <div>
          <span className="ledger-label">Rare+</span>
          <strong>{rareHitCount}</strong>
        </div>
      </div>

      <p className="sim-note">
        These are simulated random outcomes. “Source rate” and “1/x” come from the imported public official sheet weights;
        “observed” is just this run’s sampled result.
      </p>

      <div className="inventory-frame" aria-label="Maple-style result inventory">
        {sortedRows.map((row) => (
          <article key={row.item.id} className={`inventory-card ${row.rarity ?? 'common'}`}>
            <ItemIcon item={row.item} count={row.count} size="lg" />
            <div className="inventory-card__body">
              <h3>{row.item.chronodexUrl ? <a href={row.item.chronodexUrl}>{row.item.name}</a> : row.item.name}</h3>
              <div className="inventory-card__meta">
                <span className={`rarity ${row.rarity ?? 'common'}`}>{row.rarity ?? 'unknown'}</span>
                <span>{row.category ?? '—'}</span>
                {row.item.mapleItemId ? <span>ID {row.item.mapleItemId}</span> : null}
              </div>
              <div className="inventory-card__rates">
                <span>Observed {formatPercent(row.count / ticketCount)}</span>
                <a href={row.sourceUrl}>Source {row.sourcePercent ?? formatPercent(row.probability)}</a>
                <span>{formatOneIn(row.oneIn)}</span>
                <span>Expected {row.expectedCount.toFixed(row.expectedCount < 1 ? 3 : 1)}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <details className="drop-table">
        <summary>Compact run table</summary>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Item ID</th>
              <th>Count</th>
              <th>Observed</th>
              <th>Source rate</th>
              <th>1/x</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr key={row.item.id}>
                <td>{row.item.name}</td>
                <td>{row.item.mapleItemId ?? row.item.id}</td>
                <td>{row.count}</td>
                <td>{formatPercent(row.count / ticketCount)}</td>
                <td>{row.sourcePercent ?? formatPercent(row.probability)}</td>
                <td>{formatOneIn(row.oneIn)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}

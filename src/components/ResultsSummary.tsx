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
  const sortedRows = [...rows].sort(sortByRarityThenCount);
  const rareHitCount = rows
    .filter((row) => (rarityRank.get(row.rarity ?? 'common') ?? 0) >= 3)
    .reduce((sum, row) => sum + row.count, 0);

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
          <span className="ledger-label">Stacks</span>
          <strong>{rows.length}</strong>
        </div>
        <div>
          <span className="ledger-label">Rare+</span>
          <strong>{rareHitCount}</strong>
        </div>
      </div>

      <div className="inventory-frame" aria-label="Maple-style result inventory">
        {sortedRows.map((row) => (
          <article key={row.item.id} className={`inventory-card inventory-card--clean ${row.rarity ?? 'common'}`}>
            <ItemIcon item={row.item} count={row.count} size="lg" />
            <div className="inventory-card__body">
              <h3>{row.item.name}</h3>
              <div className="inventory-card__meta">
                <span className={`rarity ${row.rarity ?? 'common'}`}>{row.rarity ?? 'unknown'}</span>
                <span>{row.category ?? '—'}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="analytics-table" aria-labelledby="analytics-heading">
        <h2 id="analytics-heading">Run details</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>ID</th>
                <th>Count</th>
                <th>Observed</th>
                <th>Source rate</th>
                <th>1/x</th>
                <th>Expected</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr key={row.item.id}>
                  <td>{row.item.name}</td>
                  <td>{row.item.mapleItemId ?? row.item.id}</td>
                  <td>{row.count}</td>
                  <td>{formatPercent(row.count / ticketCount)}</td>
                  <td><a href={row.sourceUrl}>{row.sourcePercent ?? formatPercent(row.probability)}</a></td>
                  <td>{formatOneIn(row.oneIn)}</td>
                  <td>{row.expectedCount.toFixed(row.expectedCount < 1 ? 3 : 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

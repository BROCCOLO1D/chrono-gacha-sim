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
};

function sortByRarityThenCount(a: ResultSummaryRow, b: ResultSummaryRow) {
  return (
    (rarityRank.get(b.rarity ?? 'common') ?? 0) - (rarityRank.get(a.rarity ?? 'common') ?? 0) ||
    b.count - a.count ||
    a.item.name.localeCompare(b.item.name)
  );
}

export function ResultsSummary({ rows, ticketCount }: ResultsSummaryProps) {
  const rareHits = rows.filter((row) => (rarityRank.get(row.rarity ?? 'common') ?? 0) >= 3).sort(sortByRarityThenCount);
  const sortedRows = [...rows].sort(sortByRarityThenCount);
  const totalStacks = rows.length;

  return (
    <section className="maple-window results" aria-labelledby="results-heading">
      <div className="maple-titlebar">
        <span id="results-heading">Gachapon Results</span>
        <span className="maple-titlebar__buttons" aria-hidden="true">● ● ●</span>
      </div>

      <div className="results-ledger">
        <div>
          <span className="ledger-label">Tickets</span>
          <strong>{ticketCount.toLocaleString()}</strong>
        </div>
        <div>
          <span className="ledger-label">Item stacks</span>
          <strong>{totalStacks}</strong>
        </div>
        <div>
          <span className="ledger-label">Rare+</span>
          <strong>{rareHits.reduce((sum, row) => sum + row.count, 0)}</strong>
        </div>
      </div>

      <div className="inventory-frame" aria-label="Maple-style result inventory">
        {sortedRows.map((row) => (
          <article key={row.item.id} className={`inventory-card ${row.rarity ?? 'common'}`}>
            <ItemIcon item={row.item} count={row.count} size="lg" />
            <div className="inventory-card__body">
              <h3>{row.item.chronodexUrl ? <a href={row.item.chronodexUrl}>{row.item.name}</a> : row.item.name}</h3>
              <div className="inventory-card__meta">
                <span className={`rarity ${row.rarity ?? 'common'}`}>{row.rarity ?? 'unknown'}</span>
                <span>{row.category ?? '—'}</span>
              </div>
              <div className="inventory-card__rates">
                <span>Observed {((row.count / ticketCount) * 100).toFixed(2)}%</span>
                <a href={row.sourceUrl}>Source {(row.probability * 100).toFixed(3)}%</a>
              </div>
            </div>
          </article>
        ))}
      </div>

      <details className="drop-table">
        <summary>Compact drop table</summary>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Count</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr key={row.item.id}>
                <td>{row.item.name}</td>
                <td>{row.count}</td>
                <td>{(row.probability * 100).toFixed(3)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}

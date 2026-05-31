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

export function ResultsSummary({ rows, ticketCount }: ResultsSummaryProps) {
  const rareHits = rows
    .filter((row) => (rarityRank.get(row.rarity ?? 'common') ?? 0) >= 3)
    .sort((a, b) => (rarityRank.get(b.rarity ?? 'common') ?? 0) - (rarityRank.get(a.rarity ?? 'common') ?? 0));

  return (
    <section className="panel results" aria-labelledby="results-heading">
      <h2 id="results-heading">Result summary</h2>
      {rareHits.length > 0 ? (
        <div className="rare-strip" aria-label="Rare hits">
          {rareHits.map((row) => (
            <span key={row.item.id} className={`pill ${row.rarity ?? 'common'}`}>
              {row.count}× {row.item.name}
            </span>
          ))}
        </div>
      ) : (
        <p className="muted">No rare-or-better hits in this simulated run.</p>
      )}

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Rarity</th>
            <th>Category</th>
            <th>Count</th>
            <th>Observed</th>
            <th>Source rate</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.item.id}>
              <td>{row.item.chronodexUrl ? <a href={row.item.chronodexUrl}>{row.item.name}</a> : row.item.name}</td>
              <td><span className={`rarity ${row.rarity ?? 'common'}`}>{row.rarity ?? 'unknown'}</span></td>
              <td>{row.category ?? '—'}</td>
              <td>{row.count}</td>
              <td>{((row.count / ticketCount) * 100).toFixed(2)}%</td>
              <td><a href={row.sourceUrl}>{(row.probability * 100).toFixed(3)}%</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

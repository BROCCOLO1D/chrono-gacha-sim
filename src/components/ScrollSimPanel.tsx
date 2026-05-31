import { useMemo, useState } from 'react';
import { chronoScrollDataset } from '../data/chronoScroll';
import { formatStatName, makeScrollSeed, simulateScrolling } from '../lib/scroll';
import type { ScrollEquipment, ScrollItem, ScrollSimulationResult } from '../lib/scroll/types';
import { ItemIcon } from './ItemIcon';

function statList(effects: Record<string, number>) {
  const entries = Object.entries(effects).filter(([, value]) => Number.isFinite(value) && value !== 0);
  if (!entries.length) return 'No verified stat delta';
  return entries.map(([stat, value]) => `${formatStatName(stat)} ${value > 0 ? '+' : ''}${value}`).join(', ');
}

type SelectorProps<T extends ScrollEquipment | ScrollItem> = {
  label: string;
  items: T[];
  selected: T | undefined;
  query: string;
  onQueryChange: (query: string) => void;
  onSelect: (item: T) => void;
  details: (item: T) => string;
};

function ItemSelector<T extends ScrollEquipment | ScrollItem>({ label, items, selected, query, onQueryChange, onSelect, details }: SelectorProps<T>) {
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items
      .filter((item) => !needle || item.name.toLowerCase().includes(needle) || item.id.includes(needle) || item.category.toLowerCase().includes(needle))
      .slice(0, 30);
  }, [items, query]);

  return (
    <section className="maple-window selector-panel" aria-labelledby={`${label}-selector`}>
      <div className="maple-titlebar">
        <span id={`${label}-selector`}>{label}</span>
        <span className="maple-titlebar__buttons" aria-hidden="true">● ● ●</span>
      </div>
      <div className="window-body selector-body">
        <div className="selected-slot">
          {selected ? <ItemIcon item={selected} size="lg" /> : <span className="empty-slot">?</span>}
          <div>
            <strong>{selected?.name ?? `Choose ${label.toLowerCase()}`}</strong>
            <span>{selected ? `ID ${selected.id} · ${details(selected)}` : 'Search by name, id, or category.'}</span>
          </div>
        </div>
        <input
          className="search-input"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={`Search ${label.toLowerCase()}...`}
          aria-label={`Search ${label}`}
        />
        <div className="selector-list" role="listbox" aria-label={`${label} results`}>
          {filtered.map((item) => (
            <button
              type="button"
              key={item.id}
              className={selected?.id === item.id ? 'selector-option active' : 'selector-option'}
              onClick={() => onSelect(item)}
            >
              <ItemIcon item={item} size="sm" />
              <span>
                <strong>{item.name}</strong>
                <small>ID {item.id} · {details(item)}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ScrollSimPanel() {
  const defaultEquipment = chronoScrollDataset.equipment.find((item) => item.slots && item.category === 'Helmet') ?? chronoScrollDataset.equipment[0];
  const defaultScroll = chronoScrollDataset.scrolls.find((scroll) => scroll.successChance === 100 && Object.keys(scroll.effects).length) ?? chronoScrollDataset.scrolls[0];
  const [equipmentQuery, setEquipmentQuery] = useState(defaultEquipment?.name ?? '');
  const [scrollQuery, setScrollQuery] = useState(defaultScroll?.name ?? '');
  const [equipment, setEquipment] = useState<ScrollEquipment | undefined>(defaultEquipment);
  const [scroll, setScroll] = useState<ScrollItem | undefined>(defaultScroll);
  const [attempts, setAttempts] = useState(defaultEquipment?.slots ?? 1);
  const [result, setResult] = useState<ScrollSimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleRun() {
    setError(null);
    if (!equipment || !scroll) {
      setError('Select both an equipment item and a scroll first.');
      return;
    }
    try {
      setResult(simulateScrolling(equipment, scroll, Math.max(1, Math.trunc(attempts)), makeScrollSeed()));
    } catch (simError) {
      setError(simError instanceof Error ? simError.message : 'Unknown scroll simulation error.');
    }
  }

  return (
    <section className="tab-panel" aria-label="Scroll Sim">
      <div className="notice-card">
        <strong>Public-data boundary:</strong> this simulator uses checked-in ChronoDEX public equipment/scroll rows. It simulates only verified success chance, slot consumption, and inc* stat deltas; boom/destruction and hidden/special mechanics are explicitly unsupported unless present in public data.
      </div>
      <div className="scroll-grid">
        <ItemSelector
          label="Equipment"
          items={chronoScrollDataset.equipment}
          selected={equipment}
          query={equipmentQuery}
          onQueryChange={setEquipmentQuery}
          onSelect={(item) => {
            setEquipment(item);
            setAttempts(item.slots ?? attempts);
          }}
          details={(item) => `${item.category}${item.slots !== undefined ? ` · ${item.slots} slots` : ' · slots unknown'}`}
        />
        <ItemSelector
          label="Scroll"
          items={chronoScrollDataset.scrolls}
          selected={scroll}
          query={scrollQuery}
          onQueryChange={setScrollQuery}
          onSelect={setScroll}
          details={(item) => `${item.category} · ${item.successChance ?? '?'}% · ${statList(item.effects)}`}
        />
      </div>

      <section className="maple-window run-panel" aria-labelledby="scroll-run-heading">
        <div className="maple-titlebar"><span id="scroll-run-heading">Enhancement Setup</span><span className="maple-titlebar__buttons" aria-hidden="true">● ● ●</span></div>
        <div className="window-body run-body">
          <label className="field">
            <span>Attempts</span>
            <input type="number" min="1" max="100" value={attempts} onChange={(event) => setAttempts(Number(event.target.value))} />
          </label>
          <button className="primary-button" type="button" onClick={handleRun}>Run Scroll Sim</button>
          {error ? <p className="error" role="alert">{error}</p> : null}
        </div>
      </section>

      {result ? (
        <section className="maple-window result-panel" aria-labelledby="scroll-result-heading">
          <div className="maple-titlebar"><span id="scroll-result-heading">Scroll Result</span><span className="maple-titlebar__buttons" aria-hidden="true">● ● ●</span></div>
          <div className="window-body">
            <div className="summary-strip">
              <span><strong>{result.successes}</strong> success</span>
              <span><strong>{result.failures}</strong> fail</span>
              <span><strong>{result.remainingSlots ?? 'Unknown'}</strong> slots left</span>
              <span><strong>{statList(result.finalDeltas)}</strong> final delta</span>
            </div>
            <div className="sequence-list">
              {result.sequence.map((step) => (
                <div className={step.success ? 'sequence-step success' : 'sequence-step fail'} key={step.attempt}>
                  <strong>#{step.attempt} {step.success ? 'Success' : 'Fail'}</strong>
                  <span>roll {step.roll.toFixed(2)} vs {result.scroll.successChance}% · {statList(step.statDeltas)}</span>
                </div>
              ))}
            </div>
            <details className="details-table">
              <summary>Verified source details and unsupported mechanics</summary>
              <dl>
                <dt>Equipment</dt><dd>{result.equipment.name} · ID {result.equipment.id} · {result.equipment.category} · slots {result.equipment.slots ?? 'unknown'}</dd>
                <dt>Scroll</dt><dd>{result.scroll.name} · ID {result.scroll.id} · chance {result.scroll.successChance}% · {statList(result.scroll.effects)}</dd>
                <dt>Data source</dt><dd><a href={chronoScrollDataset.metadata.sourceUrl} target="_blank" rel="noreferrer">{chronoScrollDataset.metadata.label}</a> fetched {new Date(chronoScrollDataset.metadata.fetchedAt).toLocaleString()}</dd>
              </dl>
              <ul>{result.unsupportedNotes.map((note) => <li key={note}>{note}</li>)}</ul>
            </details>
          </div>
        </section>
      ) : null}
    </section>
  );
}

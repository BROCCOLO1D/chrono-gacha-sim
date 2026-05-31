import { useMemo, useState } from 'react';
import { chronoGachaDataset } from './data/chronoGacha';
import { LocationPicker } from './components/LocationPicker';
import { ResultsSummary } from './components/ResultsSummary';
import { RollControls } from './components/RollControls';
import { getLocationStats, simulateRolls, summarizePulls } from './lib/sim';
import './styles.css';

const dataset = chronoGachaDataset;
const defaultLocationId = dataset.locations[0]?.id ?? '';

function makeDefaultSeed(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatFetchedAt(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function App() {
  const [locationId, setLocationId] = useState(defaultLocationId);
  const [ticketCount, setTicketCount] = useState(50);
  const [seed, setSeed] = useState(makeDefaultSeed);
  const [lastRoll, setLastRoll] = useState(() => ({ locationId: defaultLocationId, ticketCount: 50, seed: makeDefaultSeed() }));
  const [error, setError] = useState<string | null>(null);

  const selectedLocation = dataset.locations.find((location) => location.id === locationId);
  const rolledLocation = dataset.locations.find((location) => location.id === lastRoll.locationId);
  const selectedStats = selectedLocation ? getLocationStats(dataset, selectedLocation.id) : null;

  const resultRows = useMemo(() => {
    try {
      const pulls = simulateRolls(dataset, lastRoll.locationId, lastRoll.ticketCount, lastRoll.seed);
      return summarizePulls(dataset, lastRoll.locationId, pulls);
    } catch (rollError) {
      setError(rollError instanceof Error ? rollError.message : 'Unknown simulation error.');
      return [];
    }
  }, [lastRoll]);

  function handleRoll() {
    setError(null);
    setLastRoll({ locationId, ticketCount, seed: seed.trim() || makeDefaultSeed() });
  }

  return (
    <main className="app-shell">
      <header className="maple-window hero">
        <div className="maple-titlebar">
          <span>Chrono Gachapon</span>
          <span className="maple-titlebar__buttons" aria-hidden="true">● ● ●</span>
        </div>
        <div className="hero__body">
          <p className="eyebrow">ChronoStory official-sheet simulator</p>
          <h1>Chrono Gacha Sim</h1>
          <p>
            Simulates rolls against the public ChronoStory Official Gachapon Table linked by ChronoDEX.
            Includes all seven published gachapon towns and {dataset.rates.length.toLocaleString()} weighted item rows.
          </p>
        </div>
      </header>

      <div className="grid">
        <section className="maple-window setup" aria-labelledby="setup-heading">
          <div className="maple-titlebar">
            <span id="setup-heading">Gachapon Machine</span>
            <span className="maple-titlebar__buttons" aria-hidden="true">● ● ●</span>
          </div>
          <div className="window-body">
            <LocationPicker locations={dataset.locations} selectedLocationId={locationId} onChange={setLocationId} />
            {selectedLocation && selectedStats ? (
              <div className="town-card">
                <strong>{selectedLocation.name}</strong>
                <span>{selectedStats.itemCount.toLocaleString()} official-sheet item rows</span>
                <span>Total weight: {selectedLocation.totalWeight?.toLocaleString() ?? '—'}</span>
                <a href={selectedLocation.sourceUrl}>Open source sheet tab</a>
              </div>
            ) : null}
            <div className="source-card">
              <strong>{dataset.metadata.label}</strong>
              <span>Imported: {formatFetchedAt(dataset.metadata.fetchedAt)}</span>
              <a href={dataset.metadata.sourceUrl}>ChronoDEX official gachapon sheet</a>
              <span>Icons: public MapleStory.IO GMS v83 item icon API using imported item IDs.</span>
            </div>
          </div>
        </section>

        <RollControls
          ticketCount={ticketCount}
          seed={seed}
          onTicketCountChange={setTicketCount}
          onSeedChange={setSeed}
          onRoll={handleRoll}
        />
      </div>

      {error ? <p className="error" role="alert">{error}</p> : null}

      <ResultsSummary rows={resultRows} ticketCount={lastRoll.ticketCount} locationName={rolledLocation?.name ?? lastRoll.locationId} />
    </main>
  );
}

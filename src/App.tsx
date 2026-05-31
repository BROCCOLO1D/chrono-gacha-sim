import { useMemo, useState } from 'react';
import { demoGachaDataset } from './data/demoGacha';
import { LocationPicker } from './components/LocationPicker';
import { ResultsSummary } from './components/ResultsSummary';
import { RollControls } from './components/RollControls';
import { simulateRolls, summarizePulls } from './lib/sim';
import './styles.css';

const defaultLocationId = demoGachaDataset.locations[0]?.id ?? '';

function makeDefaultSeed(): string {
  return new Date().toISOString().slice(0, 10);
}

export function App() {
  const [locationId, setLocationId] = useState(defaultLocationId);
  const [ticketCount, setTicketCount] = useState(50);
  const [seed, setSeed] = useState(makeDefaultSeed);
  const [lastRoll, setLastRoll] = useState(() => ({ locationId: defaultLocationId, ticketCount: 50, seed: makeDefaultSeed() }));
  const [error, setError] = useState<string | null>(null);

  const selectedLocation = demoGachaDataset.locations.find((location) => location.id === locationId);

  const resultRows = useMemo(() => {
    try {
      const pulls = simulateRolls(demoGachaDataset, lastRoll.locationId, lastRoll.ticketCount, lastRoll.seed);
      return summarizePulls(demoGachaDataset, lastRoll.locationId, pulls);
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
      <header className="hero">
        <p className="eyebrow">ChronoStory public-data simulator</p>
        <h1>Chrono Gacha Sim</h1>
        <p>
          Pick a gachapon location, choose a ticket count, and generate a deterministic simulated haul.
          Current data is a clearly-marked demo fixture while real public table import work is pending.
        </p>
      </header>

      <div className="grid">
        <section className="panel setup" aria-labelledby="setup-heading">
          <h2 id="setup-heading">Setup</h2>
          <LocationPicker locations={demoGachaDataset.locations} selectedLocationId={locationId} onChange={setLocationId} />
          {selectedLocation ? <p className="muted">Source: <a href={selectedLocation.sourceUrl}>{selectedLocation.sourceUrl}</a></p> : null}
          <div className="source-card">
            <strong>{demoGachaDataset.metadata.label}</strong>
            <span>Fetched/recorded: {new Date(demoGachaDataset.metadata.fetchedAt).toLocaleString()}</span>
            <a href={demoGachaDataset.metadata.sourceUrl}>ChronoDEX reference</a>
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

      <ResultsSummary rows={resultRows} ticketCount={lastRoll.ticketCount} />
    </main>
  );
}

import { useMemo, useState } from 'react';
import { chronoGachaDataset } from './data/chronoGacha';
import { LocationPicker } from './components/LocationPicker';
import { ResultsSummary } from './components/ResultsSummary';
import { RollControls } from './components/RollControls';
import { getLocationStats, simulateRolls, summarizePulls } from './lib/sim';
import './styles.css';

const dataset = chronoGachaDataset;
const defaultLocationId = dataset.locations[0]?.id ?? '';

function makeRollSeed(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function App() {
  const [locationId, setLocationId] = useState(defaultLocationId);
  const [ticketCount, setTicketCount] = useState(50);
  const [lastRoll, setLastRoll] = useState(() => ({ locationId: defaultLocationId, ticketCount: 50, seed: makeRollSeed() }));
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
    setLastRoll({ locationId, ticketCount, seed: makeRollSeed() });
  }

  return (
    <main className="app-shell">
      <header className="maple-window hero hero--compact">
        <div className="maple-titlebar">
          <span>Chrono Gachapon</span>
          <span className="maple-titlebar__buttons" aria-hidden="true">● ● ●</span>
        </div>
        <div className="hero__body">
          <h1>Chrono Gacha Sim</h1>
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
              <div className="town-card town-card--minimal">
                <strong>{selectedLocation.name}</strong>
                <span>{selectedStats.itemCount.toLocaleString()} items</span>
              </div>
            ) : null}
          </div>
        </section>

        <RollControls ticketCount={ticketCount} onTicketCountChange={setTicketCount} onRoll={handleRoll} />
      </div>

      {error ? <p className="error" role="alert">{error}</p> : null}

      <ResultsSummary rows={resultRows} ticketCount={lastRoll.ticketCount} locationName={rolledLocation?.name ?? lastRoll.locationId} />
    </main>
  );
}

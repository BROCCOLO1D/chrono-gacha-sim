import { useMemo, useState } from 'react';
import { chronoGachaDataset } from './data/chronoGacha';
import { LocationPicker } from './components/LocationPicker';
import { ResultsSummary } from './components/ResultsSummary';
import { RollControls } from './components/RollControls';
import { ScrollSimPanel } from './components/ScrollSimPanel';
import { TargetOddsPanel } from './components/TargetOddsPanel';
import { getLocationStats, simulateRolls, summarizePulls } from './lib/sim';
import './styles.css';

const dataset = chronoGachaDataset;
const defaultLocationId = dataset.locations[0]?.id ?? '';
const minTicketCount = 1;
const maxTicketCount = 100_000;

type AppTab = 'simulator' | 'target-odds' | 'scroll-sim';

function clampTicketCount(value: number): number {
  if (!Number.isFinite(value)) return minTicketCount;
  return Math.min(maxTicketCount, Math.max(minTicketCount, Math.trunc(value)));
}

function makeRollSeed(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('simulator');
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

  const renderSetupControls = (showRollButton: boolean) => (
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

      <RollControls
        ticketCount={ticketCount}
        onTicketCountChange={(value) => setTicketCount(clampTicketCount(value))}
        onRoll={showRollButton ? handleRoll : undefined}
      />
    </div>
  );

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

      <nav className="app-tabs" aria-label="App sections">
        <button
          type="button"
          className={activeTab === 'simulator' ? 'app-tab active' : 'app-tab'}
          aria-pressed={activeTab === 'simulator'}
          onClick={() => setActiveTab('simulator')}
        >
          Simulator
        </button>
        <button
          type="button"
          className={activeTab === 'target-odds' ? 'app-tab active' : 'app-tab'}
          aria-pressed={activeTab === 'target-odds'}
          onClick={() => setActiveTab('target-odds')}
        >
          Target Odds
        </button>
        <button
          type="button"
          className={activeTab === 'scroll-sim' ? 'app-tab active' : 'app-tab'}
          aria-pressed={activeTab === 'scroll-sim'}
          onClick={() => setActiveTab('scroll-sim')}
        >
          Scroll Sim
        </button>
      </nav>

      {activeTab === 'simulator' ? (
        <section className="tab-panel" aria-label="Simulator">
          {renderSetupControls(true)}
          {error ? <p className="error" role="alert">{error}</p> : null}
          <ResultsSummary rows={resultRows} ticketCount={lastRoll.ticketCount} locationName={rolledLocation?.name ?? lastRoll.locationId} />
        </section>
      ) : activeTab === 'target-odds' ? (
        <section className="tab-panel" aria-label="Target item odds">
          {renderSetupControls(false)}
          <TargetOddsPanel dataset={dataset} locationId={locationId} ticketCount={ticketCount} />
        </section>
      ) : (
        <ScrollSimPanel />
      )}
    </main>
  );
}

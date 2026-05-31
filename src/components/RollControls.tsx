const ticketPresets = [1, 10, 35, 50, 100];

type RollControlsProps = {
  ticketCount: number;
  seed: string;
  onTicketCountChange: (ticketCount: number) => void;
  onSeedChange: (seed: string) => void;
  onRoll: () => void;
};

export function RollControls({ ticketCount, seed, onTicketCountChange, onSeedChange, onRoll }: RollControlsProps) {
  return (
    <section className="panel controls" aria-labelledby="roll-controls-heading">
      <h2 id="roll-controls-heading">Roll tickets</h2>
      <label className="field">
        <span>Ticket count</span>
        <input
          min={1}
          max={100000}
          type="number"
          value={ticketCount}
          onChange={(event) => onTicketCountChange(Number(event.target.value))}
        />
      </label>
      <div className="preset-row" aria-label="Ticket presets">
        {ticketPresets.map((preset) => (
          <button key={preset} type="button" className="secondary" onClick={() => onTicketCountChange(preset)}>
            {preset}
          </button>
        ))}
      </div>
      <label className="field">
        <span>Seed</span>
        <input value={seed} onChange={(event) => onSeedChange(event.target.value)} placeholder="reproducible seed" />
      </label>
      <button type="button" className="primary" onClick={onRoll}>
        Roll {ticketCount.toLocaleString()} ticket{ticketCount === 1 ? '' : 's'}
      </button>
    </section>
  );
}

const ticketPresets = [1, 10, 35, 50, 100];

type RollControlsProps = {
  ticketCount: number;
  onTicketCountChange: (ticketCount: number) => void;
  onRoll: () => void;
};

export function RollControls({ ticketCount, onTicketCountChange, onRoll }: RollControlsProps) {
  return (
    <section className="maple-window controls" aria-labelledby="roll-controls-heading">
      <div className="maple-titlebar">
        <span id="roll-controls-heading">Tickets</span>
        <span className="maple-titlebar__buttons" aria-hidden="true">● ● ●</span>
      </div>
      <div className="window-body compact-controls">
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
        <button type="button" className="primary" onClick={onRoll}>
          Roll {ticketCount.toLocaleString()}
        </button>
      </div>
    </section>
  );
}

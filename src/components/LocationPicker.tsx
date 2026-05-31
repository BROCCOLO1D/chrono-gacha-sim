import type { GachaLocation } from '../lib/sim/types';

type LocationPickerProps = {
  locations: GachaLocation[];
  selectedLocationId: string;
  onChange: (locationId: string) => void;
};

export function LocationPicker({ locations, selectedLocationId, onChange }: LocationPickerProps) {
  return (
    <div className="town-picker" aria-label="Gachapon town selector">
      <span className="field-label">Gacha town</span>
      <div className="town-buttons">
        {locations.map((location) => (
          <button
            key={location.id}
            className={location.id === selectedLocationId ? 'town-button active' : 'town-button'}
            type="button"
            onClick={() => onChange(location.id)}
          >
            <strong>{location.name}</strong>
            <span>{location.itemCount?.toLocaleString() ?? '—'} items</span>
          </button>
        ))}
      </div>
    </div>
  );
}

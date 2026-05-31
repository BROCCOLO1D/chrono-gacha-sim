import type { GachaLocation } from '../lib/sim/types';

type LocationPickerProps = {
  locations: GachaLocation[];
  selectedLocationId: string;
  onChange: (locationId: string) => void;
};

export function LocationPicker({ locations, selectedLocationId, onChange }: LocationPickerProps) {
  return (
    <label className="field">
      <span>Gacha location</span>
      <select value={selectedLocationId} onChange={(event) => onChange(event.target.value)}>
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name}
          </option>
        ))}
      </select>
    </label>
  );
}

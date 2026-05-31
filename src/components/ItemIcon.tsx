import { useEffect, useMemo, useState } from 'react';
import type { GachaItem } from '../lib/sim/types';

type ItemIconProps = {
  item: GachaItem;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
};

const mapleVersions = [83, 95, 111, 214];

export function ItemIcon({ item, count, size = 'md' }: ItemIconProps) {
  const sources = useMemo(() => {
    const unique = new Set<string>();
    if (item.iconUrl) unique.add(item.iconUrl);
    if (item.mapleItemId) {
      for (const version of mapleVersions) {
        unique.add(`https://maplestory.io/api/GMS/${version}/item/${item.mapleItemId}/icon`);
      }
    }
    return [...unique];
  }, [item.iconUrl, item.mapleItemId]);
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => setSourceIndex(0), [item.id]);

  const activeSource = sources[sourceIndex];
  const label = count !== undefined ? `${count} ${item.name}` : item.name;

  return (
    <span className={`item-slot item-slot--${size}`} aria-label={label}>
      {activeSource ? (
        <img
          src={activeSource}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setSourceIndex((current) => current + 1)}
        />
      ) : (
        <span className="item-slot__fallback" aria-hidden="true">
          {item.name.slice(0, 2).toUpperCase()}
        </span>
      )}
      {count !== undefined && count > 1 ? <span className="item-slot__count">{count}</span> : null}
    </span>
  );
}

import type { GachaItem } from '../lib/sim/types';

type ItemIconProps = {
  item: GachaItem;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
};

export function ItemIcon({ item, count, size = 'md' }: ItemIconProps) {
  const label = count !== undefined ? `${count} ${item.name}` : item.name;

  return (
    <span className={`item-slot item-slot--${size}`} title={label} aria-label={label}>
      {item.iconUrl ? (
        <img src={item.iconUrl} alt="" loading="lazy" decoding="async" />
      ) : (
        <span className="item-slot__fallback" aria-hidden="true">
          {item.name.slice(0, 2).toUpperCase()}
        </span>
      )}
      {count !== undefined && count > 1 ? <span className="item-slot__count">{count}</span> : null}
    </span>
  );
}

import type { HotelOption, HotelTier } from '../types';

interface HotelPickerProps {
  options: HotelOption[];
  selectedTier: HotelTier;
  onSelect: (tier: HotelTier) => void;
}

const TIER_LABEL: Record<HotelTier, string> = {
  budget: 'Budget',
  standard: 'Standard',
  luxury: 'Luxury',
};

export default function HotelPicker({ options, selectedTier, onSelect }: HotelPickerProps) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">🏨 Choose your hotel</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {options.map((option) => {
          const selected = option.tier === selectedTier;
          return (
            <div
              key={option.tier}
              className={`overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-colors ${
                selected ? 'border-gold-accent shadow-[0_0_0_3px_rgba(255,218,97,0.25)]' : 'border-ink/10'
              }`}
            >
              <img
                src={option.image}
                alt={option.name}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://picsum.photos/seed/travel-default/800/500';
                }}
                className="h-28 w-full object-cover"
              />
              <div className="p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                  {TIER_LABEL[option.tier]}
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-ink">{option.name}</p>
                <p className="mt-1 font-display text-base text-ocean-mid">
                  ${option.pricePerNight}
                  <span className="text-xs font-normal text-ink/50">/night</span>
                </p>
                <p className="mt-0.5 text-xs text-ink/50">★{option.rating.toFixed(1)}</p>
                <a
                  href={option.mapsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-[11px] font-medium text-ocean-mid hover:text-ocean-deep"
                >
                  📍 Maps
                </a>
                <button
                  type="button"
                  onClick={() => onSelect(option.tier)}
                  className={`mt-2 w-full cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    selected
                      ? 'bg-gold-accent text-ink'
                      : 'bg-ocean-mid/10 text-ocean-mid hover:bg-ocean-mid/20'
                  }`}
                >
                  {selected ? 'Selected ✓' : 'Select'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
